package com.dvmotos.service;

import com.dvmotos.dto.request.ServiceOrderItemRequest;
import com.dvmotos.dto.request.ServiceOrderRequest;
import com.dvmotos.dto.request.StockMovementRequest;
import com.dvmotos.dto.response.ServiceOrderResponse;
import com.dvmotos.entity.*;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceOrderItemRepository serviceOrderItemRepository;
    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // ======================== QUERIES ========================

    @Transactional(readOnly = true)
    public Page<ServiceOrderResponse> findAll(String search, ServiceOrderStatus status, Pageable pageable) {
        Page<ServiceOrder> orders;
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasSearch && status != null) {
            orders = serviceOrderRepository.searchWithStatus(search.trim(), status, pageable);
        } else if (hasSearch) {
            orders = serviceOrderRepository.searchAll(search.trim(), pageable);
        } else if (status != null) {
            orders = serviceOrderRepository.findByStatus(status, pageable);
        } else {
            orders = serviceOrderRepository.findAll(pageable);
        }

        return orders.map(ServiceOrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ServiceOrderResponse findById(Long id) {
        ServiceOrder order = getOrderOrThrow(id);
        return ServiceOrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderResponse> findByVehicle(Long vehicleId, Pageable pageable) {
        return serviceOrderRepository.findByVehicleId(vehicleId, pageable)
                .map(ServiceOrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Long countByStatus(ServiceOrderStatus status) {
        return serviceOrderRepository.countByStatus(status);
    }

    // ======================== COMMANDS ========================

    @Transactional
    public ServiceOrderResponse create(ServiceOrderRequest request, User authenticatedUser) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        if (!vehicle.getClient().getId().equals(client.getId())) {
            throw new BusinessException("O veículo não pertence ao cliente selecionado");
        }

        ServiceOrder order = ServiceOrder.builder()
                .client(client)
                .vehicle(vehicle)
                .user(authenticatedUser)
                .status(ServiceOrderStatus.OPEN)
                .entryMileage(request.getEntryMileage())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        order = serviceOrderRepository.save(order);

        // Adiciona itens se vieram na criação
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (ServiceOrderItemRequest itemReq : request.getItems()) {
                addItemToOrder(order, itemReq, authenticatedUser);
            }
            recalculateTotals(order);
            order = serviceOrderRepository.save(order);
        }

        return ServiceOrderResponse.fromEntity(order);
    }

    @Transactional
    public ServiceOrderResponse update(Long id, ServiceOrderRequest request) {
        ServiceOrder order = getOrderOrThrow(id);
        assertEditable(order);

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        order.setClient(client);
        order.setVehicle(vehicle);
        order.setEntryMileage(request.getEntryMileage());
        order.setNotes(request.getNotes());
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);

        recalculateTotals(order);

        return ServiceOrderResponse.fromEntity(serviceOrderRepository.save(order));
    }

    @Transactional
    public ServiceOrderResponse addItem(Long osId, ServiceOrderItemRequest itemRequest, User currentUser) {
        ServiceOrder order = getOrderOrThrow(osId);
        assertEditable(order);

        addItemToOrder(order, itemRequest, currentUser);
        recalculateTotals(order);

        return ServiceOrderResponse.fromEntity(serviceOrderRepository.save(order));
    }

    @Transactional
    public ServiceOrderResponse removeItem(Long osId, Long itemId, User currentUser) {
        ServiceOrder order = getOrderOrThrow(osId);
        assertEditable(order);

        ServiceOrderItem item = order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrderItem", itemId));

        // Estorna estoque se for peça com produto vinculado
        if (item.getType() == ServiceOrderItemType.PART && item.getProduct() != null) {
            doStockMovement(item.getProduct(), item.getQuantity(), MovementType.IN,
                    "Estorno - Item removido da OS #" + osId, currentUser);
        }

        order.getItems().remove(item);
        serviceOrderItemRepository.delete(item);
        serviceOrderItemRepository.flush();
        recalculateTotals(order);

        return ServiceOrderResponse.fromEntity(serviceOrderRepository.save(order));
    }

    @Transactional
    public ServiceOrderResponse changeStatus(Long id, ServiceOrderStatus newStatus, User currentUser) {
        ServiceOrder order = getOrderOrThrow(id);
        validateStatusTransition(order.getStatus(), newStatus);

        // Ao completar
        if (newStatus == ServiceOrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());

            // Atualiza quilometragem do veículo se informada
            if (order.getEntryMileage() != null) {
                Vehicle vehicle = order.getVehicle();
                if (vehicle.getCurrentMileage() == null || order.getEntryMileage() > vehicle.getCurrentMileage()) {
                    vehicle.setCurrentMileage(order.getEntryMileage());
                    vehicleRepository.save(vehicle);
                }
            }
        }

        // Ao cancelar, estorna estoque de todas as peças
        if (newStatus == ServiceOrderStatus.CANCELLED) {
            for (ServiceOrderItem item : order.getItems()) {
                if (item.getType() == ServiceOrderItemType.PART && item.getProduct() != null) {
                    doStockMovement(item.getProduct(), item.getQuantity(), MovementType.IN,
                            "Estorno - OS #" + id + " cancelada", currentUser);
                }
            }
        }

        order.setStatus(newStatus);
        return ServiceOrderResponse.fromEntity(serviceOrderRepository.save(order));
    }

    // ======================== PRIVATE HELPERS ========================

    private ServiceOrder getOrderOrThrow(Long id) {
        return serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", id));
    }

    private void assertEditable(ServiceOrder order) {
        if (order.getStatus() != ServiceOrderStatus.OPEN && order.getStatus() != ServiceOrderStatus.IN_PROGRESS) {
            throw new BusinessException("Só é possível editar OS com status ABERTA ou EM ANDAMENTO");
        }
    }

    private void addItemToOrder(ServiceOrder order, ServiceOrderItemRequest req, User currentUser) {
        ServiceOrderItem item = ServiceOrderItem.builder()
                .serviceOrder(order)
                .type(req.getType())
                .description(req.getDescription())
                .quantity(req.getQuantity())
                .unitPrice(req.getUnitPrice())
                .totalPrice(req.getUnitPrice().multiply(BigDecimal.valueOf(req.getQuantity())))
                .build();

        // Se for peça, vincula produto e baixa estoque
        if (req.getType() == ServiceOrderItemType.PART && req.getProductId() != null) {
            Product product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", req.getProductId()));
            item.setProduct(product);

            doStockMovement(product, req.getQuantity(), MovementType.OUT,
                    "Saída automática - OS #" + order.getId(), currentUser);
        }

        order.getItems().add(item);
    }

    private void doStockMovement(Product product, int quantity, MovementType type, String reason, User currentUser) {
        StockMovementRequest movementReq = new StockMovementRequest();
        movementReq.setType(type);
        movementReq.setQuantity(quantity);
        movementReq.setReason(reason);
        productService.addStockMovement(product.getId(), movementReq, currentUser);
    }

    private void recalculateTotals(ServiceOrder order) {
        BigDecimal services = BigDecimal.ZERO;
        BigDecimal parts = BigDecimal.ZERO;

        for (ServiceOrderItem item : order.getItems()) {
            if (item.getType() == ServiceOrderItemType.SERVICE) {
                services = services.add(item.getTotalPrice());
            } else {
                parts = parts.add(item.getTotalPrice());
            }
        }

        order.setServicesAmount(services);
        order.setPartsAmount(parts);

        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        order.setTotalAmount(services.add(parts).subtract(discount));
    }

    // Mapa de transições válidas: status atual → quais status pode ir
    private static final Map<ServiceOrderStatus, Set<ServiceOrderStatus>> VALID_TRANSITIONS = Map.of(
            ServiceOrderStatus.OPEN, Set.of(
                    ServiceOrderStatus.IN_PROGRESS,
                    ServiceOrderStatus.CANCELLED),
            ServiceOrderStatus.IN_PROGRESS, Set.of(
                    ServiceOrderStatus.WAITING_PARTS,
                    ServiceOrderStatus.COMPLETED,
                    ServiceOrderStatus.CANCELLED),
            ServiceOrderStatus.WAITING_PARTS, Set.of(
                    ServiceOrderStatus.IN_PROGRESS,
                    ServiceOrderStatus.CANCELLED));

    private void validateStatusTransition(ServiceOrderStatus current, ServiceOrderStatus target) {
        if (current == ServiceOrderStatus.COMPLETED) {
            throw new BusinessException("OS já concluída não pode ter o status alterado");
        }
        if (current == ServiceOrderStatus.CANCELLED) {
            throw new BusinessException("OS cancelada não pode ter o status alterado");
        }

        Set<ServiceOrderStatus> allowed = VALID_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new BusinessException(
                    String.format("Transição inválida: %s → %s", current, target));
        }
    }
}
