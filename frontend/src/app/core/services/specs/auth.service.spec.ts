import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { AuthService, LoginRequest, AuthResponse, User } from "../auth.service";
import { environment } from "@env/environment";

describe("AuthService", () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "ADMIN",
    active: true,
  };

  const mockAuthResponse: AuthResponse = {
    token: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    type: "Bearer",
    expiresIn: 3600,
    user: mockUser,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create router spy
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
    localStorage.clear();
  });

  describe("Service Initialization", () => {
    it("should be created", () => {
      expect(service).toBeTruthy();
    });

    it("should initialize with null user when localStorage is empty", () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
    });

    it("should initialize with stored user from localStorage", () => {
      // Arrange: Store user in localStorage before service initialization
      localStorage.setItem("dvmotos_user", JSON.stringify(mockUser));
      localStorage.setItem("dvmotos_token", "stored-token");

      // Act: Create new service instance
      const newService = new AuthService(
        TestBed.inject(HttpClientTestingModule) as any,
        routerSpy,
      );

      // Assert
      expect(newService.currentUser()).toEqual(mockUser);
    });
  });

  describe("login()", () => {
    it("should successfully login and store credentials", (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      // Act
      service.login(credentials).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.getItem("dvmotos_token")).toBe(
            mockAuthResponse.token,
          );
          expect(localStorage.getItem("dvmotos_refresh_token")).toBe(
            mockAuthResponse.refreshToken,
          );
          expect(localStorage.getItem("dvmotos_user")).toBe(
            JSON.stringify(mockUser),
          );
          expect(service.currentUser()).toEqual(mockUser);
          expect(service.isAuthenticated()).toBeTrue();
          expect(service.isAdmin()).toBeTrue();
          done();
        },
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it("should handle login error", (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: "wrong@example.com",
        password: "wrongpass",
      };
      const errorResponse = { status: 401, statusText: "Unauthorized" };

      // Act
      service.login(credentials).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(localStorage.getItem("dvmotos_token")).toBeNull();
          done();
        },
      });

      // Mock HTTP error
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush("Unauthorized", errorResponse);
    });
  });

  describe("logout()", () => {
    it("should clear all stored data and navigate to login", () => {
      // Arrange: Set up authenticated state
      localStorage.setItem("dvmotos_token", "token");
      localStorage.setItem("dvmotos_refresh_token", "refresh");
      localStorage.setItem("dvmotos_user", JSON.stringify(mockUser));
      service["currentUserSignal"].set(mockUser);

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem("dvmotos_token")).toBeNull();
      expect(localStorage.getItem("dvmotos_refresh_token")).toBeNull();
      expect(localStorage.getItem("dvmotos_user")).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(["/login"]);
    });
  });

  describe("getToken()", () => {
    it("should return token from localStorage", () => {
      // Arrange
      const token = "test-token-123";
      localStorage.setItem("dvmotos_token", token);

      // Act & Assert
      expect(service.getToken()).toBe(token);
    });

    it("should return null when no token stored", () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe("refreshToken()", () => {
    it("should refresh token successfully", (done) => {
      // Arrange
      const refreshToken = "old-refresh-token";
      localStorage.setItem("dvmotos_refresh_token", refreshToken);

      // Act
      service.refreshToken().subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.getItem("dvmotos_token")).toBe(
            mockAuthResponse.token,
          );
          expect(localStorage.getItem("dvmotos_refresh_token")).toBe(
            mockAuthResponse.refreshToken,
          );
          done();
        },
      });

      // Assert HTTP request
      const req = httpMock.expectOne(
        `${environment.apiUrl}/auth/refresh?refreshToken=${refreshToken}`,
      );
      expect(req.request.method).toBe("POST");
      req.flush(mockAuthResponse);
    });

    it("should handle refresh token error", (done) => {
      // Arrange
      localStorage.setItem("dvmotos_refresh_token", "invalid-token");
      const errorResponse = { status: 403, statusText: "Forbidden" };

      // Act
      service.refreshToken().subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(403);
          done();
        },
      });

      // Mock HTTP error
      const req = httpMock.expectOne((req) => req.url.includes("auth/refresh"));
      req.flush("Invalid refresh token", errorResponse);
    });
  });

  describe("Computed Signals", () => {
    it("should correctly compute isAuthenticated", () => {
      // Initially false
      expect(service.isAuthenticated()).toBeFalse();

      // Set user and token
      service["currentUserSignal"].set(mockUser);
      localStorage.setItem("dvmotos_token", "token");
      expect(service.isAuthenticated()).toBeTrue();
    });

    it("should return false when token is removed", () => {
      // Set initial state
      service["currentUserSignal"].set(mockUser);
      localStorage.setItem("dvmotos_token", "token");
      expect(service.isAuthenticated()).toBeTrue();

      // Remove token and user
      localStorage.removeItem("dvmotos_token");
      service["currentUserSignal"].set(null);
      expect(service.isAuthenticated()).toBeFalse();
    });

    it("should correctly compute isAdmin for ADMIN role", () => {
      // Arrange
      const adminUser: User = { ...mockUser, role: "ADMIN" };
      service["currentUserSignal"].set(adminUser);

      // Assert
      expect(service.isAdmin()).toBeTrue();
    });

    it("should correctly compute isAdmin for OPERADOR role", () => {
      // Arrange
      const operatorUser: User = { ...mockUser, role: "OPERADOR" };
      service["currentUserSignal"].set(operatorUser);

      // Assert
      expect(service.isAdmin()).toBeFalse();
    });

    it("should return false for isAdmin when no user", () => {
      service["currentUserSignal"].set(null);
      expect(service.isAdmin()).toBeFalse();
    });
  });

  describe("handleAuthResponse() - Private Method", () => {
    it("should store all authentication data", (done) => {
      // Act: Trigger login which calls handleAuthResponse
      service.login({ email: "test@example.com", password: "pass" }).subscribe({
        next: () => {
          // Assert
          expect(localStorage.getItem("dvmotos_token")).toBe(
            mockAuthResponse.token,
          );
          expect(localStorage.getItem("dvmotos_refresh_token")).toBe(
            mockAuthResponse.refreshToken,
          );

          const storedUser = JSON.parse(localStorage.getItem("dvmotos_user")!);
          expect(storedUser).toEqual(mockUser);

          expect(service.currentUser()).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed user data in localStorage", () => {
      // Arrange: Store invalid JSON
      localStorage.setItem("dvmotos_user", "invalid-json{");

      // Act: This should not crash when getting stored user
      expect(() => {
        const newService = new AuthService(
          TestBed.inject(HttpClientTestingModule) as any,
          routerSpy,
        );
      }).toThrow();
    });

    it("should handle concurrent login calls", (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      let firstCompleted = false;
      let secondCompleted = false;

      // Act: Make two concurrent login calls
      service.login(credentials).subscribe(() => {
        firstCompleted = true;
        if (firstCompleted && secondCompleted) done();
      });

      service.login(credentials).subscribe(() => {
        secondCompleted = true;
        if (firstCompleted && secondCompleted) done();
      });

      // Both requests should be made
      const requests = httpMock.match(`${environment.apiUrl}/auth/login`);
      expect(requests.length).toBe(2);
      requests.forEach((req) => req.flush(mockAuthResponse));
    });
  });
});
