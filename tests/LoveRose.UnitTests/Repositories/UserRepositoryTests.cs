using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Entities.Identity;
using LoveRose.Core.Domain.Enums;
using LoveRose.Infrastructure.Data;
using LoveRose.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LoveRose.UnitTests.Repositories
{
    public class UserRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly UserRepository _userRepository;

        public UserRepositoryTests()
        {
            // Configurar DbContext en memoria para pruebas
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new ApplicationDbContext(options);

            // Configurar mocks para UserManager y RoleManager
            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(
                roleStoreMock.Object, null, null, null, null);

            _userRepository = new UserRepository(
                _dbContext, 
                _userManagerMock.Object, 
                _roleManagerMock.Object);

            // Configurar datos de prueba
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Agregar roles de prueba
            var roles = new List<Role>
            {
                new Role { Id = 1, Name = "User", NormalizedName = "USER" },
                new Role { Id = 2, Name = "Admin", NormalizedName = "ADMIN" },
                new Role { Id = 3, Name = "Model", NormalizedName = "MODEL" }
            };

            _dbContext.Roles.AddRange(roles);

            // Agregar usuarios de prueba
            var users = new List<ApplicationUser>
            {
                new ApplicationUser 
                { 
                    Id = 1, 
                    UserName = "usuario1", 
                    Email = "usuario1@test.com",
                    FirstName = "Usuario",
                    LastName = "Uno",
                    UserType = UserType.Standard,
                    Status = UserStatus.Active,
                    EmailConfirmed = true
                },
                new ApplicationUser 
                { 
                    Id = 2, 
                    UserName = "modelo1", 
                    Email = "modelo1@test.com",
                    FirstName = "Modelo",
                    LastName = "Uno",
                    UserType = UserType.Model,
                    Status = UserStatus.Active,
                    EmailConfirmed = true
                },
                new ApplicationUser 
                { 
                    Id = 3, 
                    UserName = "admin1", 
                    Email = "admin1@test.com",
                    FirstName = "Admin",
                    LastName = "Uno",
                    UserType = UserType.Admin,
                    Status = UserStatus.Inactive,
                    EmailConfirmed = true
                }
            };

            _dbContext.Users.AddRange(users);
            _dbContext.SaveChanges();
        }

        [Fact]
        public async Task GetByEmailAsync_WhenUserExists_ReturnsUser()
        {
            // Arrange
            var email = "usuario1@test.com";

            // Act
            var result = await _userRepository.GetByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
        }

        [Fact]
        public async Task GetUsersByTypeAsync_WhenCalled_ReturnsUsersOfSpecifiedType()
        {
            // Arrange
            var userType = UserType.Model;

            // Act
            var result = await _userRepository.GetUsersByTypeAsync(userType);

            // Assert
            Assert.Single(result);
            Assert.Equal(userType, result.First().UserType);
        }

        [Fact]
        public async Task UpdateUserTypeAsync_WhenUserExists_UpdatesUserType()
        {
            // Arrange
            var userId = 1;
            var newUserType = UserType.Premium;

            // Configurar el mock de UserManager
            _userManagerMock
                .Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _userRepository.UpdateUserTypeAsync(userId, newUserType);

            // Assert
            Assert.True(result);
            var updatedUser = await _dbContext.Users.FindAsync(userId);
            Assert.Equal(newUserType, updatedUser.UserType);
        }

        [Fact]
        public async Task SearchUsersAsync_WithMatchingTerm_ReturnsMatchingUsers()
        {
            // Arrange
            var searchTerm = "modelo";

            // Act
            var result = await _userRepository.SearchUsersAsync(searchTerm);

            // Assert
            Assert.Single(result);
            Assert.Contains("modelo", result.First().UserName, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task UpdateUserStatusAsync_WhenUserExists_UpdatesUserStatus()
        {
            // Arrange
            var userId = 1;
            var newStatus = UserStatus.Suspended;

            // Configurar el mock de UserManager
            _userManagerMock
                .Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _userRepository.UpdateUserStatusAsync(userId, newStatus);

            // Assert
            Assert.True(result);
            var updatedUser = await _dbContext.Users.FindAsync(userId);
            Assert.Equal(newStatus, updatedUser.Status);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }
    }
}
