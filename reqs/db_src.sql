create schema serviços;
use serviços;

create table Usuario
(
	ID       int primary key auto_increment,
    nome     varchar(256) not null,
    email    varchar(256) not null,
    senha    char(128)    not null, -- SHA256
    is_admin boolean      not null default false
);

create table Catergoria
(
	ID   int primary key auto_increment,
    nome varchar(256)
);

create table Servico
(
	ID                   int primary key auto_increment,
    id_Catergoria        int not null,
    id_Dono              int,
    nome_estabelecimento varchar(256) not null,
    nome_dono_anonimo    varchar(256),
    horario_aberto       time,
    horario_fechado      time,
    horario_pico         time,
    local_bloco          char(2),
    local_sala           int,
    local_complemento    varchar(256),
    local_pos_x          double,
    local_pos_y          double,
	
	foreign key (id_Catergoria)       references Catergoria(ID),
	foreign key (id_Dono)             references Usuario(ID)
);

create table Item
(
	ID         int primary key auto_increment,
	id_Servico int,
	nome       varchar(256),
	tipo       varchar(256),
	preco      decimal(6,2),
	
	foreign key (id_Servico) references Servico(ID)
);

/*
create table Contribuicao
(
	ID int primary key auto_increment,
    id_Usuario int,
    id_Servico int,
    informacao_alvo varchar(256),
    nova_informacao varchar(256),
    
	foreign key (id_Usuario) references Usuario(ID),
	foreign key (id_Servico) references Servico(ID)
);

create table Comentario
(
	ID int primary key auto_increment,
    id_Usuario int,
    id_Servico int,
    conteudo varchar(256),
    avaliacao double,
    
	foreign key (id_Usuario) references Usuario(ID),
	foreign key (id_Servico) references Servico(ID)
);
*/
