import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  UserService,
  User,
  Page,
  ChangePasswordRequest,
} from "../user.service";
import { environment } from "@env/environment";

describe("UserService", () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/users`;

  const mockUser: User = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "ADMIN",
    active: true,
    createdAt: "2024-01-01T00:00:00",
  };

  const mockPage: Page<User> = {
    content: [mockUser],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("Service Initialization", () => {
    it("should be created", () => {
      expect(service).toBeTruthy();
    });
  });

  // ==================== MY PROFILE METHODS ====================

  describe("getMyProfile()", () => {
    it("should get current user profile", (done) => {
      service.getMyProfile().subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe("GET");
      req.flush(mockUser);
    });

    it("should handle profile fetch error", (done) => {
      service.getMyProfile().subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush("Profile not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("updateMyProfile()", () => {
    it("should update current user profile", (done) => {
      const updates: Partial<User> = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      service.updateMyProfile(updates).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockUser);
    });

    it("should handle partial updates", (done) => {
      const updates: Partial<User> = { name: "Only Name Changed" };

      service.updateMyProfile(updates).subscribe({
        next: (user) => {
          expect(user).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.body).toEqual(updates);
      req.flush(mockUser);
    });
  });

  describe("changeMyPassword()", () => {
    it("should change current user password", (done) => {
      const passwordRequest: ChangePasswordRequest = {
        currentPassword: "oldpass123",
        newPassword: "newpass456",
      };

      service.changeMyPassword(passwordRequest).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me/password`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual(passwordRequest);
      req.flush({ message: "Password changed successfully" });
    });

    it("should handle wrong current password error", (done) => {
      const passwordRequest: ChangePasswordRequest = {
        currentPassword: "wrongpass",
        newPassword: "newpass456",
      };

      service.changeMyPassword(passwordRequest).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me/password`);
      req.flush("Current password is incorrect", {
        status: 400,
        statusText: "Bad Request",
      });
    });
  });

  // ==================== ADMIN METHODS ====================

  describe("findAll()", () => {
    it("should fetch all users with default pagination", (done) => {
      service.findAll().subscribe({
        next: (page) => {
          expect(page).toEqual(mockPage);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch users with custom pagination", (done) => {
      service.findAll(2, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=2&size=10`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch users with search parameter", (done) => {
      const searchTerm = "john";

      service.findAll(0, 20, searchTerm).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=${searchTerm}`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch only active users", (done) => {
      service.findAll(0, 20, undefined, true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=true`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch only inactive users", (done) => {
      service.findAll(0, 20, undefined, false).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=false`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch all users when active is null", (done) => {
      service.findAll(0, 20, undefined, null).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      expect(req.request.params.has("active")).toBeFalse();
      req.flush(mockPage);
    });

    it("should combine search and active filters", (done) => {
      service.findAll(0, 20, "admin", true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=admin&active=true`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });
  });

  describe("findById()", () => {
    it("should fetch user by id", (done) => {
      const userId = 1;

      service.findById(userId).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockUser);
    });

    it("should handle user not found error", (done) => {
      const userId = 999;

      service.findById(userId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush("User not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("create()", () => {
    it("should create new user", (done) => {
      const newUser: User = {
        name: "New User",
        email: "new@example.com",
        password: "password123",
        role: "OPERADOR",
      };

      service.create(newUser).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(newUser);
      req.flush(mockUser);
    });

    it("should handle validation errors", (done) => {
      const invalidUser: User = {
        name: "",
        email: "invalid-email",
        role: "ADMIN",
      };

      service.create(invalidUser).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Validation failed", {
        status: 400,
        statusText: "Bad Request",
      });
    });
  });

  describe("update()", () => {
    it("should update existing user", (done) => {
      const userId = 1;
      const updates: User = {
        name: "Updated User",
        email: "updated@example.com",
        role: "ADMIN",
      };

      service.update(userId, updates).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockUser);
    });

    it("should handle update of non-existent user", (done) => {
      const userId = 999;
      const updates: User = {
        name: "Updated User",
        email: "updated@example.com",
        role: "ADMIN",
      };

      service.update(userId, updates).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush("User not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("delete()", () => {
    it("should delete user", (done) => {
      const userId = 1;

      service.delete(userId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("should handle delete of non-existent user", (done) => {
      const userId = 999;

      service.delete(userId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush("User not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("activate()", () => {
    it("should activate user", (done) => {
      const userId = 1;

      service.activate(userId).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/activate`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockUser);
    });
  });

  describe("toggleStatus()", () => {
    it("should toggle user status", (done) => {
      const userId = 1;

      service.toggleStatus(userId).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockUser);
    });

    it("should handle toggle error", (done) => {
      const userId = 999;

      service.toggleStatus(userId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/toggle-status`);
      req.flush("User not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("changePassword() - Admin", () => {
    it("should change user password as admin", (done) => {
      const userId = 1;
      const newPassword = "newpassword123";

      service.changePassword(userId, newPassword).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/password`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({ password: newPassword });
      req.flush({ message: "Password changed" });
    });

    it("should handle weak password error", (done) => {
      const userId = 1;
      const weakPassword = "123";

      service.changePassword(userId, weakPassword).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/password`);
      req.flush("Password too weak", {
        status: 400,
        statusText: "Bad Request",
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty search string", (done) => {
      service.findAll(0, 20, "").subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      req.flush(mockPage);
    });

    it("should handle special characters in search", (done) => {
      const specialSearch = "test@#$%";

      service.findAll(0, 20, specialSearch).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        (req) =>
          req.method === "GET" &&
          req.url === apiUrl &&
          req.params.get("page") === "0" &&
          req.params.get("size") === "20" &&
          req.params.get("search") === specialSearch,
      );

      req.flush(mockPage);
    });

    it("should handle very large page size", (done) => {
      service.findAll(0, 1000).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=1000`);
      req.flush(mockPage);
    });

    it("should handle negative page number", (done) => {
      service.findAll(-1, 20).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=-1&size=20`);
      req.flush(mockPage);
    });
  });
});
