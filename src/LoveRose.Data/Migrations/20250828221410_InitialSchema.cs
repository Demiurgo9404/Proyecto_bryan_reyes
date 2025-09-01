using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoveRose.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_AspNetUsers_UserId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Products_ProductId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_AspNetUsers_UserId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Products_ProductId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Products_ProductId1",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_ProductId1",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Offers",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "Transactions");

            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.RenameTable(
                name: "Transactions",
                newName: "transactions",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "products",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Offers",
                newName: "offers",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetUserTokens",
                newName: "AspNetUserTokens",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetUsers",
                newName: "AspNetUsers",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetUserRoles",
                newName: "AspNetUserRoles",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetUserLogins",
                newName: "AspNetUserLogins",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetUserClaims",
                newName: "AspNetUserClaims",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetRoles",
                newName: "AspNetRoles",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "AspNetRoleClaims",
                newName: "AspNetRoleClaims",
                newSchema: "public");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "transactions",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "TransactionDate",
                schema: "public",
                table: "transactions",
                newName: "transactiondate");

            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "public",
                table: "transactions",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                schema: "public",
                table: "transactions",
                newName: "productid");

            migrationBuilder.RenameColumn(
                name: "Notes",
                schema: "public",
                table: "transactions",
                newName: "notes");

            migrationBuilder.RenameColumn(
                name: "CompletedDate",
                schema: "public",
                table: "transactions",
                newName: "completeddate");

            migrationBuilder.RenameColumn(
                name: "Amount",
                schema: "public",
                table: "transactions",
                newName: "amount");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "transactions",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_UserId",
                schema: "public",
                table: "transactions",
                newName: "ix_transactions_userid");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_ProductId",
                schema: "public",
                table: "transactions",
                newName: "ix_transactions_productid");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                schema: "public",
                table: "products",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "Price",
                schema: "public",
                table: "products",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "public",
                table: "products",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                schema: "public",
                table: "products",
                newName: "isactive");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                schema: "public",
                table: "products",
                newName: "imageurl");

            migrationBuilder.RenameColumn(
                name: "Description",
                schema: "public",
                table: "products",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                schema: "public",
                table: "products",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "products",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "offers",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                schema: "public",
                table: "offers",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "public",
                table: "offers",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                schema: "public",
                table: "offers",
                newName: "productid");

            migrationBuilder.RenameColumn(
                name: "OfferAmount",
                schema: "public",
                table: "offers",
                newName: "offeramount");

            migrationBuilder.RenameColumn(
                name: "Message",
                schema: "public",
                table: "offers",
                newName: "message");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                schema: "public",
                table: "offers",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "offers",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_UserId",
                schema: "public",
                table: "offers",
                newName: "ix_offers_userid");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_ProductId",
                schema: "public",
                table: "offers",
                newName: "ix_offers_productid");

            migrationBuilder.RenameColumn(
                name: "Value",
                schema: "public",
                table: "AspNetUserTokens",
                newName: "value");

            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "public",
                table: "AspNetUserTokens",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "LoginProvider",
                schema: "public",
                table: "AspNetUserTokens",
                newName: "loginprovider");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "AspNetUserTokens",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "UserName",
                schema: "public",
                table: "AspNetUsers",
                newName: "username");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                schema: "public",
                table: "AspNetUsers",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "TwoFactorEnabled",
                schema: "public",
                table: "AspNetUsers",
                newName: "twofactorenabled");

            migrationBuilder.RenameColumn(
                name: "SecurityStamp",
                schema: "public",
                table: "AspNetUsers",
                newName: "securitystamp");

            migrationBuilder.RenameColumn(
                name: "ProfileImageUrl",
                schema: "public",
                table: "AspNetUsers",
                newName: "profileimageurl");

            migrationBuilder.RenameColumn(
                name: "PhoneNumberConfirmed",
                schema: "public",
                table: "AspNetUsers",
                newName: "phonenumberconfirmed");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                schema: "public",
                table: "AspNetUsers",
                newName: "phonenumber");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                schema: "public",
                table: "AspNetUsers",
                newName: "passwordhash");

            migrationBuilder.RenameColumn(
                name: "NormalizedUserName",
                schema: "public",
                table: "AspNetUsers",
                newName: "normalizedusername");

            migrationBuilder.RenameColumn(
                name: "NormalizedEmail",
                schema: "public",
                table: "AspNetUsers",
                newName: "normalizedemail");

            migrationBuilder.RenameColumn(
                name: "LockoutEnd",
                schema: "public",
                table: "AspNetUsers",
                newName: "lockoutend");

            migrationBuilder.RenameColumn(
                name: "LockoutEnabled",
                schema: "public",
                table: "AspNetUsers",
                newName: "lockoutenabled");

            migrationBuilder.RenameColumn(
                name: "LastName",
                schema: "public",
                table: "AspNetUsers",
                newName: "lastname");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                schema: "public",
                table: "AspNetUsers",
                newName: "isactive");

            migrationBuilder.RenameColumn(
                name: "FirstName",
                schema: "public",
                table: "AspNetUsers",
                newName: "firstname");

            migrationBuilder.RenameColumn(
                name: "EmailConfirmed",
                schema: "public",
                table: "AspNetUsers",
                newName: "emailconfirmed");

            migrationBuilder.RenameColumn(
                name: "Email",
                schema: "public",
                table: "AspNetUsers",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "DateOfBirth",
                schema: "public",
                table: "AspNetUsers",
                newName: "dateofbirth");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                schema: "public",
                table: "AspNetUsers",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "ConcurrencyStamp",
                schema: "public",
                table: "AspNetUsers",
                newName: "concurrencystamp");

            migrationBuilder.RenameColumn(
                name: "AccessFailedCount",
                schema: "public",
                table: "AspNetUsers",
                newName: "accessfailedcount");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "AspNetUsers",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                schema: "public",
                table: "AspNetUserRoles",
                newName: "roleid");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "AspNetUserRoles",
                newName: "userid");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserRoles_RoleId",
                schema: "public",
                table: "AspNetUserRoles",
                newName: "IX_AspNetUserRoles_roleid");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "AspNetUserLogins",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "ProviderDisplayName",
                schema: "public",
                table: "AspNetUserLogins",
                newName: "providerdisplayname");

            migrationBuilder.RenameColumn(
                name: "ProviderKey",
                schema: "public",
                table: "AspNetUserLogins",
                newName: "providerkey");

            migrationBuilder.RenameColumn(
                name: "LoginProvider",
                schema: "public",
                table: "AspNetUserLogins",
                newName: "loginprovider");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserLogins_UserId",
                schema: "public",
                table: "AspNetUserLogins",
                newName: "IX_AspNetUserLogins_userid");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "public",
                table: "AspNetUserClaims",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "ClaimValue",
                schema: "public",
                table: "AspNetUserClaims",
                newName: "claimvalue");

            migrationBuilder.RenameColumn(
                name: "ClaimType",
                schema: "public",
                table: "AspNetUserClaims",
                newName: "claimtype");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "AspNetUserClaims",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserClaims_UserId",
                schema: "public",
                table: "AspNetUserClaims",
                newName: "IX_AspNetUserClaims_userid");

            migrationBuilder.RenameColumn(
                name: "NormalizedName",
                schema: "public",
                table: "AspNetRoles",
                newName: "normalizedname");

            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "public",
                table: "AspNetRoles",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "ConcurrencyStamp",
                schema: "public",
                table: "AspNetRoles",
                newName: "concurrencystamp");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "AspNetRoles",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                schema: "public",
                table: "AspNetRoleClaims",
                newName: "roleid");

            migrationBuilder.RenameColumn(
                name: "ClaimValue",
                schema: "public",
                table: "AspNetRoleClaims",
                newName: "claimvalue");

            migrationBuilder.RenameColumn(
                name: "ClaimType",
                schema: "public",
                table: "AspNetRoleClaims",
                newName: "claimtype");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "AspNetRoleClaims",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                schema: "public",
                table: "AspNetRoleClaims",
                newName: "IX_AspNetRoleClaims_roleid");

            migrationBuilder.AlterColumn<string>(
                name: "userid",
                schema: "public",
                table: "transactions",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "imageurl",
                schema: "public",
                table: "products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "profileimageurl",
                schema: "public",
                table: "AspNetUsers",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "dateofbirth",
                schema: "public",
                table: "AspNetUsers",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddPrimaryKey(
                name: "PK_transactions",
                schema: "public",
                table: "transactions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_products",
                schema: "public",
                table: "products",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_offers",
                schema: "public",
                table: "offers",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_roleid",
                schema: "public",
                table: "AspNetRoleClaims",
                column: "roleid",
                principalSchema: "public",
                principalTable: "AspNetRoles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserClaims",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserLogins",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_roleid",
                schema: "public",
                table: "AspNetUserRoles",
                column: "roleid",
                principalSchema: "public",
                principalTable: "AspNetRoles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserRoles",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserTokens",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_offers_products_productid",
                schema: "public",
                table: "offers",
                column: "productid",
                principalSchema: "public",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_offers_users_userid",
                schema: "public",
                table: "offers",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_transactions_products_productid",
                schema: "public",
                table: "transactions",
                column: "productid",
                principalSchema: "public",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_transactions_users_userid",
                schema: "public",
                table: "transactions",
                column: "userid",
                principalSchema: "public",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_roleid",
                schema: "public",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_roleid",
                schema: "public",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_userid",
                schema: "public",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "fk_offers_products_productid",
                schema: "public",
                table: "offers");

            migrationBuilder.DropForeignKey(
                name: "fk_offers_users_userid",
                schema: "public",
                table: "offers");

            migrationBuilder.DropForeignKey(
                name: "fk_transactions_products_productid",
                schema: "public",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "fk_transactions_users_userid",
                schema: "public",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_transactions",
                schema: "public",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_products",
                schema: "public",
                table: "products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_offers",
                schema: "public",
                table: "offers");

            migrationBuilder.RenameTable(
                name: "transactions",
                schema: "public",
                newName: "Transactions");

            migrationBuilder.RenameTable(
                name: "products",
                schema: "public",
                newName: "Products");

            migrationBuilder.RenameTable(
                name: "offers",
                schema: "public",
                newName: "Offers");

            migrationBuilder.RenameTable(
                name: "AspNetUserTokens",
                schema: "public",
                newName: "AspNetUserTokens");

            migrationBuilder.RenameTable(
                name: "AspNetUsers",
                schema: "public",
                newName: "AspNetUsers");

            migrationBuilder.RenameTable(
                name: "AspNetUserRoles",
                schema: "public",
                newName: "AspNetUserRoles");

            migrationBuilder.RenameTable(
                name: "AspNetUserLogins",
                schema: "public",
                newName: "AspNetUserLogins");

            migrationBuilder.RenameTable(
                name: "AspNetUserClaims",
                schema: "public",
                newName: "AspNetUserClaims");

            migrationBuilder.RenameTable(
                name: "AspNetRoles",
                schema: "public",
                newName: "AspNetRoles");

            migrationBuilder.RenameTable(
                name: "AspNetRoleClaims",
                schema: "public",
                newName: "AspNetRoleClaims");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "Transactions",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "transactiondate",
                table: "Transactions",
                newName: "TransactionDate");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Transactions",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "productid",
                table: "Transactions",
                newName: "ProductId");

            migrationBuilder.RenameColumn(
                name: "notes",
                table: "Transactions",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "completeddate",
                table: "Transactions",
                newName: "CompletedDate");

            migrationBuilder.RenameColumn(
                name: "amount",
                table: "Transactions",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Transactions",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "ix_transactions_userid",
                table: "Transactions",
                newName: "IX_Transactions_UserId");

            migrationBuilder.RenameIndex(
                name: "ix_transactions_productid",
                table: "Transactions",
                newName: "IX_Transactions_ProductId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Products",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "Products",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Products",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "isactive",
                table: "Products",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "imageurl",
                table: "Products",
                newName: "ImageUrl");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Products",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Products",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Products",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "Offers",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Offers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Offers",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "productid",
                table: "Offers",
                newName: "ProductId");

            migrationBuilder.RenameColumn(
                name: "offeramount",
                table: "Offers",
                newName: "OfferAmount");

            migrationBuilder.RenameColumn(
                name: "message",
                table: "Offers",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Offers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Offers",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "ix_offers_userid",
                table: "Offers",
                newName: "IX_Offers_UserId");

            migrationBuilder.RenameIndex(
                name: "ix_offers_productid",
                table: "Offers",
                newName: "IX_Offers_ProductId");

            migrationBuilder.RenameColumn(
                name: "value",
                table: "AspNetUserTokens",
                newName: "Value");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "AspNetUserTokens",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "loginprovider",
                table: "AspNetUserTokens",
                newName: "LoginProvider");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "AspNetUserTokens",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "username",
                table: "AspNetUsers",
                newName: "UserName");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "AspNetUsers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "twofactorenabled",
                table: "AspNetUsers",
                newName: "TwoFactorEnabled");

            migrationBuilder.RenameColumn(
                name: "securitystamp",
                table: "AspNetUsers",
                newName: "SecurityStamp");

            migrationBuilder.RenameColumn(
                name: "profileimageurl",
                table: "AspNetUsers",
                newName: "ProfileImageUrl");

            migrationBuilder.RenameColumn(
                name: "phonenumberconfirmed",
                table: "AspNetUsers",
                newName: "PhoneNumberConfirmed");

            migrationBuilder.RenameColumn(
                name: "phonenumber",
                table: "AspNetUsers",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "passwordhash",
                table: "AspNetUsers",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "normalizedusername",
                table: "AspNetUsers",
                newName: "NormalizedUserName");

            migrationBuilder.RenameColumn(
                name: "normalizedemail",
                table: "AspNetUsers",
                newName: "NormalizedEmail");

            migrationBuilder.RenameColumn(
                name: "lockoutend",
                table: "AspNetUsers",
                newName: "LockoutEnd");

            migrationBuilder.RenameColumn(
                name: "lockoutenabled",
                table: "AspNetUsers",
                newName: "LockoutEnabled");

            migrationBuilder.RenameColumn(
                name: "lastname",
                table: "AspNetUsers",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "isactive",
                table: "AspNetUsers",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "firstname",
                table: "AspNetUsers",
                newName: "FirstName");

            migrationBuilder.RenameColumn(
                name: "emailconfirmed",
                table: "AspNetUsers",
                newName: "EmailConfirmed");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "AspNetUsers",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "dateofbirth",
                table: "AspNetUsers",
                newName: "DateOfBirth");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "AspNetUsers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "concurrencystamp",
                table: "AspNetUsers",
                newName: "ConcurrencyStamp");

            migrationBuilder.RenameColumn(
                name: "accessfailedcount",
                table: "AspNetUsers",
                newName: "AccessFailedCount");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetUsers",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "roleid",
                table: "AspNetUserRoles",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "AspNetUserRoles",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserRoles_roleid",
                table: "AspNetUserRoles",
                newName: "IX_AspNetUserRoles_RoleId");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "AspNetUserLogins",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "providerdisplayname",
                table: "AspNetUserLogins",
                newName: "ProviderDisplayName");

            migrationBuilder.RenameColumn(
                name: "providerkey",
                table: "AspNetUserLogins",
                newName: "ProviderKey");

            migrationBuilder.RenameColumn(
                name: "loginprovider",
                table: "AspNetUserLogins",
                newName: "LoginProvider");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserLogins_userid",
                table: "AspNetUserLogins",
                newName: "IX_AspNetUserLogins_UserId");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "AspNetUserClaims",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "claimvalue",
                table: "AspNetUserClaims",
                newName: "ClaimValue");

            migrationBuilder.RenameColumn(
                name: "claimtype",
                table: "AspNetUserClaims",
                newName: "ClaimType");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetUserClaims",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserClaims_userid",
                table: "AspNetUserClaims",
                newName: "IX_AspNetUserClaims_UserId");

            migrationBuilder.RenameColumn(
                name: "normalizedname",
                table: "AspNetRoles",
                newName: "NormalizedName");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "AspNetRoles",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "concurrencystamp",
                table: "AspNetRoles",
                newName: "ConcurrencyStamp");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetRoles",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "roleid",
                table: "AspNetRoleClaims",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "claimvalue",
                table: "AspNetRoleClaims",
                newName: "ClaimValue");

            migrationBuilder.RenameColumn(
                name: "claimtype",
                table: "AspNetRoleClaims",
                newName: "ClaimType");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetRoleClaims",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetRoleClaims_roleid",
                table: "AspNetRoleClaims",
                newName: "IX_AspNetRoleClaims_RoleId");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Transactions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450);

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "Transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProfileImageUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Offers",
                table: "Offers",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ProductId1",
                table: "Transactions",
                column: "ProductId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_AspNetUsers_UserId",
                table: "Offers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Products_ProductId",
                table: "Offers",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_AspNetUsers_UserId",
                table: "Transactions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Products_ProductId",
                table: "Transactions",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Products_ProductId1",
                table: "Transactions",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
