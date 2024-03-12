-- TipoUsuario definition

CREATE TABLE TipoUsuario (
	IDTipoUsuario INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	NombreTipo TEXT NOT NULL
);


-- Usuario definition

CREATE TABLE Usuario (
	IDUsuario INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	Nombre TEXT NOT NULL,
	Correo TEXT NOT NULL,
	Contrasena TEXT NOT NULL,
	IDTipoUsuario INTEGER NOT NULL,
	CONSTRAINT Usuario_TipoUsuario_FK FOREIGN KEY (IDTipoUsuario) REFERENCES TipoUsuario(IDTipoUsuario)
);