package com.dvmotos.service;

import com.dvmotos.dto.request.VehicleRequest;
import com.dvmotos.dto.response.VehicleResponse;
import com.dvmotos.entity.Client;
import com.dvmotos.entity.Vehicle;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.ClientRepository;
import com.dvmotos.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public Page<VehicleResponse> findAll(String search, Pageable pageable) {
        Page<Vehicle> vehicles = (search != null && !search.trim().isEmpty())
            ? vehicleRepository.search(search.trim(), pageable)
            : vehicleRepository.findByActiveTrue(pageable);
        return vehicles.map(VehicleResponse::fromEntity);
    }

    public VehicleResponse findById(Long id) {
        return VehicleResponse.fromEntity(vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id)));
    }

    public VehicleResponse findByLicensePlate(String licensePlate) {
        return VehicleResponse.fromEntity(vehicleRepository.findByLicensePlate(licensePlate.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + licensePlate)));
    }

    public List<VehicleResponse> findByClient(Long clientId) {
        return vehicleRepository.findByClientIdAndActiveTrue(clientId).stream()
                .map(VehicleResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
        String plate = request.getLicensePlate().toUpperCase();
        if (vehicleRepository.existsByLicensePlate(plate)) {
            throw new BusinessException("A vehicle with this license plate already exists");
        }
        if (request.getChassisNumber() != null && vehicleRepository.existsByChassisNumber(request.getChassisNumber())) {
            throw new BusinessException("A vehicle with this chassis number already exists");
        }
        Vehicle vehicle = Vehicle.builder()
                .client(client).licensePlate(plate).brand(request.getBrand())
                .model(request.getModel()).year(request.getYear()).color(request.getColor())
                .chassisNumber(request.getChassisNumber()).currentMileage(request.getCurrentMileage())
                .notes(request.getNotes()).build();
        return VehicleResponse.fromEntity(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleResponse update(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
        String plate = request.getLicensePlate().toUpperCase();
        if (!plate.equals(vehicle.getLicensePlate()) && vehicleRepository.existsByLicensePlate(plate)) {
            throw new BusinessException("A vehicle with this license plate already exists");
        }
        if (request.getChassisNumber() != null && !request.getChassisNumber().equals(vehicle.getChassisNumber())) {
            if (vehicleRepository.existsByChassisNumber(request.getChassisNumber())) {
                throw new BusinessException("A vehicle with this chassis number already exists");
            }
        }
        vehicle.setClient(client); vehicle.setLicensePlate(plate);
        vehicle.setBrand(request.getBrand()); vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear()); vehicle.setColor(request.getColor());
        vehicle.setChassisNumber(request.getChassisNumber());
        vehicle.setCurrentMileage(request.getCurrentMileage()); vehicle.setNotes(request.getNotes());
        return VehicleResponse.fromEntity(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void delete(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
    }
}
