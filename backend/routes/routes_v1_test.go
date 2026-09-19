package routes_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"github.com/reppo/go-backend/internal/transport/http/handler"
	"github.com/reppo/go-backend/routes"
	"golang.org/x/crypto/bcrypt"
)

type inMemUserRepo struct {
	users      map[int64]*entity.User
	byEmail    map[string]*entity.User
	byUsername map[string]*entity.User
	nextID     int64
}

func newInMemUserRepo() *inMemUserRepo {
	return &inMemUserRepo{
		users:      make(map[int64]*entity.User),
		byEmail:    make(map[string]*entity.User),
		byUsername: make(map[string]*entity.User),
		nextID:     1,
	}
}

func (r *inMemUserRepo) GetByID(ctx context.Context, id int64) (*entity.User, error) {
	if u, ok := r.users[id]; ok {
		return u, nil
	}
	return nil, domain.ErrUserNotFound
}

func (r *inMemUserRepo) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	if u, ok := r.byEmail[email]; ok {
		return u, nil
	}
	return nil, domain.ErrUserNotFound
}

func (r *inMemUserRepo) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	if u, ok := r.byUsername[username]; ok {
		return u, nil
	}
	return nil, domain.ErrUserNotFound
}

func (r *inMemUserRepo) List(ctx context.Context, limit, offset int32) ([]*entity.User, error) {
	var list []*entity.User
	for _, u := range r.users {
		list = append(list, u)
	}
	return list, nil
}

func (r *inMemUserRepo) ListAll(ctx context.Context) ([]*entity.User, error) {
	var list []*entity.User
	for _, u := range r.users {
		list = append(list, u)
	}
	return list, nil
}

func (r *inMemUserRepo) Count(ctx context.Context) (int64, error) {
	return int64(len(r.users)), nil
}

func (r *inMemUserRepo) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	user.ID = r.nextID
	r.nextID++
	r.users[user.ID] = user
	r.byEmail[user.Email] = user
	r.byUsername[user.UserName] = user
	return user, nil
}

func (r *inMemUserRepo) Update(ctx context.Context, user *entity.User) (*entity.User, error) {
	r.users[user.ID] = user
	return user, nil
}

func (r *inMemUserRepo) UpdateProfile(ctx context.Context, user *entity.User) (*entity.User, error) {
	existing, ok := r.users[user.ID]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	existing.FirstName = user.FirstName
	existing.LastName = user.LastName
	return existing, nil
}

func (r *inMemUserRepo) UpdatePassword(ctx context.Context, id int64, hashedPassword string) error {
	existing, ok := r.users[id]
	if !ok {
		return domain.ErrUserNotFound
	}
	existing.Password = hashedPassword
	return nil
}

func (r *inMemUserRepo) Delete(ctx context.Context, id int64) error {
	delete(r.users, id)
	return nil
}

type inMemRoleRepo struct {
	roles       map[int64]*entity.Role
	permissions []*entity.Permission
	nextID      int64
}

func newInMemRoleRepo() *inMemRoleRepo {
	return &inMemRoleRepo{
		roles:  make(map[int64]*entity.Role),
		nextID: 1,
	}
}

func (r *inMemRoleRepo) GetByID(ctx context.Context, id int64) (*entity.Role, error) {
	if role, ok := r.roles[id]; ok {
		return role, nil
	}
	return nil, domain.ErrRoleNotFound
}

func (r *inMemRoleRepo) GetByName(ctx context.Context, name string) (*entity.Role, error) {
	for _, role := range r.roles {
		if role.Name == name {
			return role, nil
		}
	}
	return nil, domain.ErrRoleNotFound
}

func (r *inMemRoleRepo) List(ctx context.Context) ([]*entity.Role, error) {
	var list []*entity.Role
	for _, role := range r.roles {
		list = append(list, role)
	}
	return list, nil
}

func (r *inMemRoleRepo) Create(ctx context.Context, name string, perms []int64) (*entity.Role, error) {
	role := &entity.Role{
		ID:   r.nextID,
		Name: name,
	}
	r.nextID++
	r.roles[role.ID] = role
	return role, nil
}

func (r *inMemRoleRepo) Update(ctx context.Context, id int64, name string, perms []int64) (*entity.Role, error) {
	if role, ok := r.roles[id]; ok {
		role.Name = name
		return role, nil
	}
	return nil, domain.ErrRoleNotFound
}

func (r *inMemRoleRepo) Delete(ctx context.Context, id int64) error {
	delete(r.roles, id)
	return nil
}

func (r *inMemRoleRepo) ListPermissions(ctx context.Context) ([]*entity.Permission, error) {
	return r.permissions, nil
}

type inMemCategoryRepo struct {
	categories map[int64]*entity.Category
	nextID     int64
}

func newInMemCategoryRepo() *inMemCategoryRepo {
	return &inMemCategoryRepo{
		categories: make(map[int64]*entity.Category),
		nextID:     1,
	}
}

func (r *inMemCategoryRepo) GetByID(ctx context.Context, id int64) (*entity.Category, error) {
	if c, ok := r.categories[id]; ok {
		return c, nil
	}
	return nil, domain.ErrCategoryNotFound
}

func (r *inMemCategoryRepo) GetBySlug(ctx context.Context, slug string) (*entity.Category, error) {
	for _, c := range r.categories {
		if c.Slug == slug {
			return c, nil
		}
	}
	return nil, domain.ErrCategoryNotFound
}

func (r *inMemCategoryRepo) List(ctx context.Context) ([]*entity.Category, error) {
	var list []*entity.Category
	for _, c := range r.categories {
		list = append(list, c)
	}
	return list, nil
}

func (r *inMemCategoryRepo) GetTree(ctx context.Context) ([]*entity.Category, error) {
	var nodes []*entity.Category
	for _, c := range r.categories {
		if c.ParentID == nil || *c.ParentID == 0 {
			nodes = append(nodes, c)
		}
	}
	return nodes, nil
}

func (r *inMemCategoryRepo) Create(ctx context.Context, category *entity.Category) (*entity.Category, error) {
	category.ID = r.nextID
	r.nextID++
	r.categories[category.ID] = category
	return category, nil
}

func (r *inMemCategoryRepo) Update(ctx context.Context, category *entity.Category) (*entity.Category, error) {
	r.categories[category.ID] = category
	return category, nil
}

func (r *inMemCategoryRepo) Delete(ctx context.Context, id int64) error {
	delete(r.categories, id)
	return nil
}

type inMemProductRepo struct {
	products map[int64]*entity.Product
	nextID   int64
}

func newInMemProductRepo() *inMemProductRepo {
	return &inMemProductRepo{
		products: make(map[int64]*entity.Product),
		nextID:   1,
	}
}

func (r *inMemProductRepo) GetByID(ctx context.Context, id int64) (*entity.Product, error) {
	if p, ok := r.products[id]; ok {
		return p, nil
	}
	return nil, domain.ErrProductNotFound
}

func (r *inMemProductRepo) GetBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	for _, p := range r.products {
		if p.Slug == slug {
			return p, nil
		}
	}
	return nil, domain.ErrProductNotFound
}

func (r *inMemProductRepo) List(ctx context.Context, params repository.ProductListParams) ([]*entity.Product, error) {
	var list []*entity.Product
	for _, p := range r.products {
		if params.CategoryID != nil && (p.CategoryID == nil || *p.CategoryID != *params.CategoryID) {
			continue
		}
		if params.IsActive != nil && p.IsActive != *params.IsActive {
			continue
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *inMemProductRepo) ListAll(ctx context.Context) ([]*entity.Product, error) {
	var list []*entity.Product
	for _, p := range r.products {
		list = append(list, p)
	}
	return list, nil
}

func (r *inMemProductRepo) Count(ctx context.Context, params repository.ProductListParams) (int64, error) {
	var count int64
	for _, p := range r.products {
		if params.CategoryID != nil && (p.CategoryID == nil || *p.CategoryID != *params.CategoryID) {
			continue
		}
		if params.IsActive != nil && p.IsActive != *params.IsActive {
			continue
		}
		count++
	}
	return count, nil
}

func (r *inMemProductRepo) Create(ctx context.Context, product *entity.Product) (*entity.Product, error) {
	product.ID = r.nextID
	r.nextID++
	r.products[product.ID] = product
	return product, nil
}

func (r *inMemProductRepo) Update(ctx context.Context, product *entity.Product) (*entity.Product, error) {
	r.products[product.ID] = product
	return product, nil
}

func (r *inMemProductRepo) UpdateStock(ctx context.Context, id int64, newStock int32) error {
	p, ok := r.products[id]
	if !ok {
		return domain.ErrProductNotFound
	}
	p.Stock = newStock
	return nil
}

func (r *inMemProductRepo) Delete(ctx context.Context, id int64) error {
	delete(r.products, id)
	return nil
}

type inMemFavoriteRepo struct {
	favorites map[int64]*entity.Favorite
	nextID    int64
}

func newInMemFavoriteRepo() *inMemFavoriteRepo {
	return &inMemFavoriteRepo{
		favorites: make(map[int64]*entity.Favorite),
		nextID:    1,
	}
}

func (r *inMemFavoriteRepo) ListByUserID(ctx context.Context, userID int64) ([]*entity.Favorite, error) {
	var list []*entity.Favorite
	for _, f := range r.favorites {
		if f.UserID == userID {
			list = append(list, f)
		}
	}
	return list, nil
}

func (r *inMemFavoriteRepo) IsFavorite(ctx context.Context, userID, productID int64) (bool, error) {
	for _, f := range r.favorites {
		if f.UserID == userID && f.ProductID == productID {
			return true, nil
		}
	}
	return false, nil
}

func (r *inMemFavoriteRepo) Add(ctx context.Context, userID, productID int64) (*entity.Favorite, error) {
	for _, f := range r.favorites {
		if f.UserID == userID && f.ProductID == productID {
			return f, nil
		}
	}
	fav := &entity.Favorite{
		ID:        r.nextID,
		UserID:    userID,
		ProductID: productID,
		CreatedAt: time.Now(),
	}
	r.nextID++
	r.favorites[fav.ID] = fav
	return fav, nil
}

func (r *inMemFavoriteRepo) Remove(ctx context.Context, userID, productID int64) error {
	for id, f := range r.favorites {
		if f.UserID == userID && f.ProductID == productID {
			delete(r.favorites, id)
			return nil
		}
	}
	return nil
}

type inMemOrderRepo struct {
	orders []*entity.Order
	nextID int64
}

func newInMemOrderRepo() *inMemOrderRepo {
	return &inMemOrderRepo{
		orders: []*entity.Order{},
		nextID: 1,
	}
}

func (r *inMemOrderRepo) CreateOrderAtomic(ctx context.Context, params repository.CreateOrderParams) (*entity.Order, error) {
	items := make([]entity.OrderItem, len(params.Items))
	for i, it := range params.Items {
		items[i] = entity.OrderItem{
			ID:           int64(i + 1),
			OrderID:      r.nextID,
			ProductID:    it.ProductID,
			ProductTitle: it.ProductTitle,
			Price:        it.Price,
			Quantity:     it.Quantity,
			CreatedAt:    time.Now(),
		}
	}

	order := &entity.Order{
		ID:              r.nextID,
		UserID:          params.UserID,
		FirstName:       params.FirstName,
		LastName:        params.LastName,
		Email:           params.Email,
		TotalAmount:     params.TotalAmount,
		ShippingAddress: params.ShippingAddress,
		Status:          params.Status,
		OrderItems:      items,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	r.nextID++
	r.orders = append(r.orders, order)
	return order, nil
}

func (r *inMemOrderRepo) GetByID(ctx context.Context, id int64) (*entity.Order, error) {
	for _, o := range r.orders {
		if o.ID == id {
			return o, nil
		}
	}
	return nil, domain.ErrOrderNotFound
}

func (r *inMemOrderRepo) ListByUserID(ctx context.Context, userID int64) ([]*entity.Order, error) {
	var list []*entity.Order
	for _, o := range r.orders {
		if o.UserID != nil && *o.UserID == userID {
			list = append(list, o)
		}
	}
	return list, nil
}

func (r *inMemOrderRepo) ListAll(ctx context.Context, params repository.OrderListParams) ([]*entity.Order, error) {
	return r.orders, nil
}

func (r *inMemOrderRepo) Count(ctx context.Context) (int64, error) {
	return int64(len(r.orders)), nil
}

func (r *inMemOrderRepo) UpdateStatus(ctx context.Context, id int64, status entity.OrderStatus) (*entity.Order, error) {
	for _, o := range r.orders {
		if o.ID == id {
			o.Status = status
			return o, nil
		}
	}
	return nil, domain.ErrOrderNotFound
}

func (r *inMemOrderRepo) GetDailySales(ctx context.Context) ([]entity.DailySalesMetric, error) {
	return []entity.DailySalesMetric{
		{SaleDate: "2026-09-19", TotalSales: 299.99, OrderCount: 1},
	}, nil
}

func (r *inMemOrderRepo) GetAllForExport(ctx context.Context) ([]entity.OrderExportRow, error) {
	var rows []entity.OrderExportRow
	for _, o := range r.orders {
		for _, it := range o.OrderItems {
			rows = append(rows, entity.OrderExportRow{
				OrderID:      o.ID,
				CustomerName: o.FullName(),
				Email:        o.Email,
				TotalAmount:  o.TotalAmount,
				Status:       string(o.Status),
				CreatedAt:    o.CreatedAt,
				ProductTitle: it.ProductTitle,
				ItemPrice:    it.Price,
				Quantity:     it.Quantity,
			})
		}
	}
	return rows, nil
}

type inMemTicketRepo struct {
	tickets  []*entity.Ticket
	messages []*entity.TicketMessage
	nextID   int64
}

func newInMemTicketRepo() *inMemTicketRepo {
	return &inMemTicketRepo{
		tickets:  []*entity.Ticket{},
		messages: []*entity.TicketMessage{},
		nextID:   1,
	}
}

func (r *inMemTicketRepo) Create(ctx context.Context, t *entity.Ticket) (*entity.Ticket, error) {
	created := *t
	created.ID = r.nextID
	created.CreatedAt = time.Now()
	created.UpdatedAt = time.Now()
	r.nextID++
	r.tickets = append(r.tickets, &created)
	return &created, nil
}

func (r *inMemTicketRepo) GetByID(ctx context.Context, id int64) (*entity.Ticket, error) {
	for _, t := range r.tickets {
		if t.ID == id {
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (r *inMemTicketRepo) ListByUserID(ctx context.Context, userID int64, limit, offset int32) ([]*entity.Ticket, int64, error) {
	var list []*entity.Ticket
	for _, t := range r.tickets {
		if t.UserID == userID {
			list = append(list, t)
		}
	}
	return list, int64(len(list)), nil
}

func (r *inMemTicketRepo) ListAll(ctx context.Context, status, priority string, limit, offset int32) ([]*entity.Ticket, int64, error) {
	var list []*entity.Ticket
	for _, t := range r.tickets {
		if (status == "" || string(t.Status) == status) && (priority == "" || string(t.Priority) == priority) {
			list = append(list, t)
		}
	}
	return list, int64(len(list)), nil
}

func (r *inMemTicketRepo) UpdateStatus(ctx context.Context, id int64, status entity.TicketStatus) (*entity.Ticket, error) {
	for _, t := range r.tickets {
		if t.ID == id {
			t.Status = status
			t.UpdatedAt = time.Now()
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (r *inMemTicketRepo) Assign(ctx context.Context, id int64, assignedTo int64) (*entity.Ticket, error) {
	for _, t := range r.tickets {
		if t.ID == id {
			t.AssignedTo = &assignedTo
			t.UpdatedAt = time.Now()
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (r *inMemTicketRepo) CreateMessage(ctx context.Context, msg *entity.TicketMessage) (*entity.TicketMessage, error) {
	created := *msg
	created.ID = int64(len(r.messages) + 1)
	created.CreatedAt = time.Now()
	r.messages = append(r.messages, &created)
	return &created, nil
}

func (r *inMemTicketRepo) ListMessagesByTicketID(ctx context.Context, ticketID int64) ([]*entity.TicketMessage, error) {
	var msgs []*entity.TicketMessage
	for _, m := range r.messages {
		if m.TicketID == ticketID {
			msgs = append(msgs, m)
		}
	}
	return msgs, nil
}

func (r *inMemTicketRepo) CountUnresolved(ctx context.Context) (int64, error) {
	var c int64
	for _, t := range r.tickets {
		if t.Status == entity.TicketStatusOpen || t.Status == entity.TicketStatusInProgress {
			c++
		}
	}
	return c, nil
}

type inMemDashboardRepo struct{}

func (r *inMemDashboardRepo) GetSummary(ctx context.Context) (*repository.DashboardSummary, error) {
	return &repository.DashboardSummary{
		TotalRevenue:    1234.50,
		TotalOrders:     10,
		PendingOrders:   2,
		DeliveredOrders: 8,
		TotalUsers:      25,
		ActiveProducts:  15,
		OpenTickets:     1,
	}, nil
}

func (r *inMemDashboardRepo) GetDailyRevenueSeries(ctx context.Context) ([]*repository.DailyRevenue, error) {
	return []*repository.DailyRevenue{
		{OrderDate: time.Now(), OrderCount: 1, Revenue: 1234.50},
	}, nil
}

func (r *inMemDashboardRepo) GetOrdersStatusBreakdown(ctx context.Context) ([]*repository.OrderStatusCount, error) {
	return []*repository.OrderStatusCount{
		{Status: "delivered", Count: 8, TotalAmount: 1000.00},
	}, nil
}

func (r *inMemDashboardRepo) GetTopSellingCategories(ctx context.Context) ([]*repository.TopCategory, error) {
	return []*repository.TopCategory{
		{CategoryID: 1, CategoryName: "Laptops", ItemsSold: 5, Revenue: 1000.00},
	}, nil
}

func (r *inMemDashboardRepo) GetRecentOrders(ctx context.Context, limit int32) ([]*repository.RecentOrder, error) {
	return []*repository.RecentOrder{
		{ID: 1, FirstName: "Admin", LastName: "User", Email: "admin@test.com", Total: 100.0, Status: "delivered", CreatedAt: time.Now()},
	}, nil
}

func (r *inMemDashboardRepo) GetRecentTickets(ctx context.Context, limit int32) ([]*repository.RecentTicket, error) {
	return []*repository.RecentTicket{
		{ID: 1, Subject: "Test ticket", Status: "open", Priority: "medium", Category: "general", CreatedAt: time.Now(), UserFirstName: "Regular", UserLastName: "User", UserEmail: "user@test.com"},
	}, nil
}

func setupV1TestApp() (*fiber.App, security.TokenManager) {
	app := fiber.New()
	userRepo := newInMemUserRepo()
	roleRepo := newInMemRoleRepo()
	catRepo := newInMemCategoryRepo()
	prodRepo := newInMemProductRepo()
	favRepo := newInMemFavoriteRepo()
	orderRepo := newInMemOrderRepo()
	ticketRepo := newInMemTicketRepo()
	dashRepo := &inMemDashboardRepo{}

	hasher := security.NewBcryptHasher(bcrypt.MinCost)
	tokenManager := security.NewJWTTokenManager("test-v1-secret-key-32-chars-at-least-required", time.Hour)

	authSvc := service.NewAuthService(userRepo, hasher, tokenManager)
	userSvc := service.NewUserService(userRepo, hasher)
	roleSvc := service.NewRoleService(roleRepo)
	catSvc := service.NewCategoryService(catRepo)
	prodSvc := service.NewProductService(prodRepo)
	favSvc := service.NewFavoriteService(favRepo)
	orderSvc := service.NewOrderService(orderRepo)
	ticketSvc := service.NewTicketService(ticketRepo)
	dashSvc := service.NewDashboardService(dashRepo)

	// Pre-seed an admin and a regular user
	adminPass, _ := hasher.HashPassword("AdminPass123!")
	_, _ = userRepo.Create(context.Background(), &entity.User{
		Email:    "admin@test.com",
		UserName: "admin",
		Password: adminPass,
		RoleID:   2,
		RoleName: "admin",
	})

	userPass, _ := hasher.HashPassword("UserPass123!")
	_, _ = userRepo.Create(context.Background(), &entity.User{
		Email:    "user@test.com",
		UserName: "regularuser",
		Password: userPass,
		RoleID:   1,
		RoleName: "customer",
	})

	// Pre-seed a category and product
	cat, _ := catRepo.Create(context.Background(), &entity.Category{
		Name: "Laptops",
		Slug: "laptops",
	})

	_, _ = prodRepo.Create(context.Background(), &entity.Product{
		Title:      "Pro Laptop 15",
		Slug:       "pro-laptop-15",
		Price:      1299.99,
		Stock:      10,
		CategoryID: &cat.ID,
		IsActive:   true,
	})

	deps := &routes.RouteDependencies{
		AuthHandler:      handler.NewAuthHandler(authSvc),
		UserHandler:      handler.NewUserHandler(userSvc),
		RoleHandler:      handler.NewRoleHandler(roleSvc),
		CategoryHandler:  handler.NewCategoryHandler(catSvc),
		ProductHandler:   handler.NewProductHandler(prodSvc),
		OrderHandler:     handler.NewOrderHandler(orderSvc),
		FavoriteHandler:  handler.NewFavoriteHandler(favSvc),
		TicketHandler:    handler.NewTicketHandler(ticketSvc),
		DashboardHandler: handler.NewDashboardHandler(dashSvc),
		TokenManager:     tokenManager,
	}

	routes.Setup(app, deps)
	return app, tokenManager
}

func TestV1AuthEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()

	t.Run("Register_Success", func(t *testing.T) {
		payload := []byte(`{
			"first_name": "Alice",
			"last_name": "Smith",
			"user_name": "alicesmith",
			"email": "alice@test.com",
			"password": "Password123!",
			"password_confirm": "Password123!"
		}`)

		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		if res["success"] != true {
			t.Errorf("expected success true, got %v", res["success"])
		}
	})

	t.Run("Login_Success", func(t *testing.T) {
		payload := []byte(`{
			"email": "admin@test.com",
			"password": "AdminPass123!"
		}`)

		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		if res["success"] != true {
			t.Errorf("expected success true, got %v", res["success"])
		}
	})

	t.Run("Me_Unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/auth/me", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
	})

	t.Run("Me_AuthenticatedWithBearerToken", func(t *testing.T) {
		token, _ := tm.GenerateToken(1, "admin@test.com", "admin")

		req := httptest.NewRequest("GET", "/api/v1/auth/me", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		if res["success"] != true {
			t.Errorf("expected success true, got %v", res["success"])
		}
	})

	t.Run("AdminOnlyUsersEndpoint_ForbiddenForCustomer", func(t *testing.T) {
		customerToken, _ := tm.GenerateToken(2, "user@test.com", "customer")

		req := httptest.NewRequest("GET", "/api/v1/users/", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden for customer, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminOnlyUsersEndpoint_AllowedForAdmin", func(t *testing.T) {
		adminToken, _ := tm.GenerateToken(1, "admin@test.com", "admin")

		req := httptest.NewRequest("GET", "/api/v1/users/", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK for admin, got %d", resp.StatusCode)
		}
	})
}

func TestV1CategoryEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()

	t.Run("ListCategories_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/categories", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetTree_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/categories/tree", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetCategoryByID_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/categories/1", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetCategoryByID_NotFound", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/categories/999", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected 404 Not Found, got %d", resp.StatusCode)
		}
	})

	t.Run("GetCategoryBySlug_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/categories/slug/laptops", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateCategory_Unauthenticated", func(t *testing.T) {
		payload := []byte(`{"name":"Smartphones","slug":"smartphones"}`)
		req := httptest.NewRequest("POST", "/api/v1/categories", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateCategory_CustomerForbidden", func(t *testing.T) {
		customerToken, _ := tm.GenerateToken(2, "user@test.com", "customer")
		payload := []byte(`{"name":"Smartphones","slug":"smartphones"}`)
		req := httptest.NewRequest("POST", "/api/v1/categories", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateCategory_AdminSuccess", func(t *testing.T) {
		adminToken, _ := tm.GenerateToken(1, "admin@test.com", "admin")
		payload := []byte(`{"name":"Smartphones","slug":"smartphones"}`)
		req := httptest.NewRequest("POST", "/api/v1/categories", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}
	})
}

func TestV1ProductEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()

	t.Run("ListProducts_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/products?page=1&limit=10", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		if res["success"] != true {
			t.Errorf("expected success true, got %v", res["success"])
		}
		meta, ok := res["meta"].(map[string]interface{})
		if !ok || meta["total"] == nil {
			t.Errorf("expected meta with total, got %v", res["meta"])
		}
	})

	t.Run("GetProductByID_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/products/1", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetProductByID_NotFound", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/products/999", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected 404 Not Found, got %d", resp.StatusCode)
		}
	})

	t.Run("GetProductBySlug_PublicSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/products/slug/pro-laptop-15", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateProduct_Unauthenticated", func(t *testing.T) {
		payload := []byte(`{"title":"Mechanical Keyboard","price":89.99}`)
		req := httptest.NewRequest("POST", "/api/v1/products", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateProduct_CustomerForbidden", func(t *testing.T) {
		customerToken, _ := tm.GenerateToken(2, "user@test.com", "customer")
		payload := []byte(`{"title":"Mechanical Keyboard","price":89.99}`)
		req := httptest.NewRequest("POST", "/api/v1/products", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden, got %d", resp.StatusCode)
		}
	})

	t.Run("CreateProduct_AdminSuccess", func(t *testing.T) {
		adminToken, _ := tm.GenerateToken(1, "admin@test.com", "admin")
		payload := []byte(`{"title":"Mechanical Keyboard","price":89.99}`)
		req := httptest.NewRequest("POST", "/api/v1/products", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}
	})
}

func TestV1FavoriteEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()
	customerToken, _ := tm.GenerateToken(2, "user@test.com", "customer")

	t.Run("ListFavorites_Unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/favorites", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", resp.StatusCode)
		}
	})

	t.Run("AddFavorite_Success", func(t *testing.T) {
		payload := []byte(`{"product_id": 1}`)
		req := httptest.NewRequest("POST", "/api/v1/favorites", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}
	})

	t.Run("CheckFavorite_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/favorites/check/1", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		data := res["data"].(map[string]interface{})
		if data["is_favorite"] != true {
			t.Errorf("expected is_favorite true, got %v", data["is_favorite"])
		}
	})

	t.Run("ListFavorites_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/favorites", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("RemoveFavorite_Success", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/v1/favorites/1", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})
}

func TestV1OrderEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()
	customerToken, _ := tm.GenerateToken(2, "user@test.com", "customer")
	adminToken, _ := tm.GenerateToken(1, "admin@test.com", "admin")

	t.Run("CreateOrder_Success", func(t *testing.T) {
		payload := []byte(`{
			"first_name": "Customer",
			"last_name": "User",
			"email": "user@test.com",
			"shipping_address": "123 Street",
			"items": [
				{
					"product_id": 1,
					"product_title": "Pro Laptop 15",
					"price": 1299.99,
					"quantity": 1
				}
			]
		}`)
		req := httptest.NewRequest("POST", "/api/v1/orders", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		data := res["data"].(map[string]interface{})
		if data["total"] == nil || data["total"].(float64) < 1000 {
			t.Errorf("expected valid total, got %v", data["total"])
		}
	})

	t.Run("GetMyOrders_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/orders/my", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetOrder_OwnerSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/orders/1", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminListOrders_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/orders?page=1&limit=10", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminExportCSV_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/orders/export", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
		if ct := resp.Header.Get("Content-Type"); ct != "text/csv" {
			t.Errorf("expected Content-Type text/csv, got %q", ct)
		}
	})

	t.Run("AdminSalesChart_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/orders/chart", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})
}

func TestV1TicketEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()

	userToken, _ := tm.GenerateToken(2, "regularuser", "customer")
	otherToken, _ := tm.GenerateToken(3, "otheruser", "customer")
	adminToken, _ := tm.GenerateToken(1, "admin", "admin")

	var ticketID float64

	t.Run("CreateTicket_CustomerSuccess", func(t *testing.T) {
		payload := []byte(`{
			"subject": "Billing issue with Order #1",
			"priority": "high",
			"category": "billing",
			"initial_message": "Hello, I was charged twice for order #1."
		}`)

		req := httptest.NewRequest("POST", "/api/v1/tickets", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+userToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		data := res["data"].(map[string]interface{})
		ticketID = data["id"].(float64)
		if data["subject"] != "Billing issue with Order #1" {
			t.Errorf("expected subject match, got %v", data["subject"])
		}
	})

	t.Run("GetTicketByID_OwnerSuccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/tickets/%d", int(ticketID)), nil)
		req.Header.Set("Authorization", "Bearer "+userToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("GetTicketByID_OtherUserForbidden", func(t *testing.T) {
		req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/tickets/%d", int(ticketID)), nil)
		req.Header.Set("Authorization", "Bearer "+otherToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden, got %d", resp.StatusCode)
		}
	})

	t.Run("AddMessage_CustomerSuccess", func(t *testing.T) {
		payload := []byte(`{
			"message": "Any updates on this ticket?"
		}`)

		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/tickets/%d/messages", int(ticketID)), bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+userToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminListAllTickets_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/tickets?page=1&limit=10", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminUpdateStatus_Success", func(t *testing.T) {
		payload := []byte(`{"status": "resolved"}`)

		req := httptest.NewRequest("PUT", fmt.Sprintf("/api/v1/tickets/%d/status", int(ticketID)), bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}
	})
}

func TestV1DashboardEndpoints(t *testing.T) {
	app, tm := setupV1TestApp()
	adminToken, _ := tm.GenerateToken(1, "admin", "admin")

	t.Run("AdminGetDashboardMetrics_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/dashboard/metrics", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var res map[string]interface{}
		json.Unmarshal(body, &res)
		if res["success"] != true {
			t.Errorf("expected success true, got %v", res["success"])
		}

		data := res["data"].(map[string]interface{})
		if data["summary"] == nil {
			t.Errorf("expected summary in data, got nil")
		}
		if data["revenue_series"] == nil {
			t.Errorf("expected revenue_series in data, got nil")
		}
	})
}


