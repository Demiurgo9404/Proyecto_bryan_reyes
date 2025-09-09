# Configuración de la solución LoveRose

# Crear la solución
dotnet new sln -n LoveRose

# Crear proyectos
# API (Presentation Layer)
dotnet new webapi -n LoveRose.API

# Core (Domain Layer)
dotnet new classlib -n LoveRose.Core

# Infrastructure (Data Access Layer)
dotnet new classlib -n LoveRose.Infrastructure

# Tests
dotnet new xunit -n LoveRose.Tests.Unit

# Agregar proyectos a la solución
dotnet sln add LoveRose.API\LoveRose.API.csproj
dotnet sln add LoveRose.Core\LoveRose.Core.csproj
dotnet sln add LoveRose.Infrastructure\LoveRose.Infrastructure.csproj
dotnet sln add LoveRose.Tests.Unit\LoveRose.Tests.Unit.csproj

# Agregar referencias entre proyectos
# API -> Core, Infrastructure
dotnet add LoveRose.API\LoveRose.API.csproj reference LoveRose.Core\LoveRose.Core.csproj

# Infrastructure -> Core
dotnet add LoveRose.Infrastructure\LoveRose.Infrastructure.csproj reference LoveRose.Core\LoveRose.Core.csproj

# Tests -> API, Core, Infrastructure
dotnet add LoveRose.Tests.Unit\LoveRose.Tests.Unit.csproj reference LoveRose.API\LoveRose.API.csproj
dotnet add LoveRose.Tests.Unit\LoveRose.Tests.Unit.csproj reference LoveRose.Core\LoveRose.Core.csproj
dotnet add LoveRose.Tests.Unit\LoveRose.Tests.Unit.csproj reference LoveRose.Infrastructure\LoveRose.Infrastructure.csproj

# Instalar paquetes NuGet comunes
# Para API
cd LoveRose.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.AspNetCore
dotnet add package Swashbuckle.AspNetCore
cd ..

# Para Infrastructure
cd LoveRose.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.Extensions.Configuration
dotnet add package Microsoft.Extensions.DependencyInjection.Abstractions
cd ..

# Para Tests
cd LoveRose.Tests.Unit
dotnet add package Microsoft.NET.Test.Sdk
dotnet add package Moq
dotnet add coverlet.msbuild
dotnet add Microsoft.AspNetCore.Mvc.Testing
cd ..

# Crear carpetas básicas
# API
New-Item -ItemType Directory -Path "LoveRose.API\Controllers" -Force
New-Item -ItemType Directory -Path "LoveRose.API\DTOs" -Force
New-Item -ItemType Directory -Path "LoveRose.API\Middleware" -Force
New-Item -ItemType Directory -Path "LoveRose.API\Configurations" -Force

# Core
New-Item -ItemType Directory -Path "LoveRose.Core\Entities" -Force
New-Item -ItemType Directory -Path "LoveRose.Core\Interfaces" -Force
New-Item -ItemType Directory -Path "LoveRose.Core\Services" -Force
New-Item -ItemType Directory -Path "LoveRose.Core\Exceptions" -Force
New-Item -ItemType Directory -Path "LoveRose.Core\Events" -Force
New-Item -ItemType Directory -Path "LoveRose.Core\ValueObjects" -Force

# Infrastructure
New-Item -ItemType Directory -Path "LoveRose.Infrastructure\Data" -Force
New-Item -ItemType Directory -Path "LoveRose.Infrastructure\Repositories" -Force
New-Item -ItemType Directory -Path "LoveRose.Infrastructure\Services" -Force
New-Item -ItemType Directory -Path "LoveRose.Infrastructure\Migrations" -Force

# Tests
New-Item -ItemType Directory -Path "LoveRose.Tests.Unit\Services" -Force
New-Item -ItemType Directory -Path "LoveRose.Tests.Unit\Controllers" -Force
New-Item -ItemType Directory -Path "LoveRose.Tests.Unit\Repositories" -Force

Write-Host "Configuración completada. Ejecuta 'dotnet build' para compilar la solución." -ForegroundColor Green
