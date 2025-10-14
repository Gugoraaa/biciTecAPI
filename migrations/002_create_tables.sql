-- Create Usuarios table (updated from users to match your schema)
CREATE TABLE IF NOT EXISTS Usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    matricula VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    en_viaje BOOL DEFAULT FALSE,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Estaciones table
CREATE TABLE IF NOT EXISTS Estaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    longitud DOUBLE NOT NULL,
    latitud DOUBLE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    bicicletas BIGINT DEFAULT 0,
    capacidad_max BIGINT NOT NULL,
    estado ENUM('Operational', 'Maintenance') DEFAULT 'Operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create bicicletas table
CREATE TABLE IF NOT EXISTS bicicletas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    estado ENUM('Available', 'InUse', 'Maintenance') DEFAULT 'Available',
    tamaño VARCHAR(50),
    estacion BIGINT,
    vel_prom BIGINT DEFAULT 0,
    total_km BIGINT DEFAULT 0,
    prioridad ENUM('alta', 'media', 'baja') DEFAULT 'media',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estacion) REFERENCES Estaciones(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create viajes table
CREATE TABLE IF NOT EXISTS viajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_bicicleta BIGINT NOT NULL,
    fecha_uso DATE NOT NULL,
    tiempo_uso BIGINT DEFAULT 0,
    fecha_terminado DATE DEFAULT NULL,
    distancia BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_bicicleta) REFERENCES bicicletas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Tickets table
CREATE TABLE IF NOT EXISTS Tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    estado ENUM('Open', 'InProgress', 'Done') DEFAULT 'Open',
    prioridad ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    id_bici BIGINT,
    descripcion TEXT,
    fecha_reporte DATE NOT NULL,
    fecha_entrega DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_bici) REFERENCES bicicletas(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
