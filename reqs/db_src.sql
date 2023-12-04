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
    id_Catergoria        int,
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

create table Item
(
	ID         int primary key auto_increment,
	id_Servico int,
	nome       varchar(256),
	tipo       varchar(256),
	preco      decimal(6,2),
	
	foreign key (id_Servico) references Servico(ID)
);

#----------------

insert into Usuario(nome, email, senha, is_admin) values ('Josefino Amarildo', 'josesinho@gmail.com', '1d9aca83b145944e6ddf3991196c3cdde99ed626e49770f12b8f69674005bb9b', false);
insert into Usuario(nome, email, senha, is_admin) values ('Rebecca dos Santos', 'rebecca@outlook.com', '12de7648dd8e95e9d817ad08cf2b911b12073e304d7de18f2cbcc890548d72ca', true);
insert into Usuario(nome, email, senha, is_admin) values ('Mario Luigi', 'mario@hotmail.com', '2319dced3396e51e553083d1673f1014c9e93465a86cfac4c656b953bcc7ac52', false);

insert into Catergoria(nome) values ('Lanchonete');
insert into Catergoria(nome) values ('Loja');

insert into Servico(nome_estabelecimento, id_Catergoria, id_Dono, nome_dono_anonimo, horario_aberto, horario_fechado, horario_pico, local_bloco, local_sala, local_complemento, local_pos_x, local_pos_y)
values ('Tentação do Mate', 1, 3, null, '12:00:00', '22:00:00', '18:45:00', 'B5', 407, 'Próximo à biblioteca', 2043.65, 723.23);

insert into Servico(nome_estabelecimento, id_Catergoria, id_Dono, nome_dono_anonimo, horario_aberto, horario_fechado, horario_pico, local_bloco, local_sala, local_complemento, local_pos_x, local_pos_y)
values ('Loja do Cláudio', 2, null, 'Cláudio', '15:00:00', '21:30:00', '18:00:00', 'C3', '102', null, 1853.32, 2353.6);

insert into Contribuicao(id_Usuario, id_Servico, informacao_alvo, nova_informacao)
values (1, 1, 'Horário Pico', '19:00:00');
insert into Contribuicao(id_Usuario, id_Servico, informacao_alvo, nova_informacao)
values (2, 1, 'Dono', 'Douglas Castro');

insert into Comentario(id_Usuario, id_Servico, conteudo, avaliacao)
values (3, 1, 'hmm pizza quentinha', 5.0);

insert into Item(id_Servico, nome, tipo, preco) values (1, 'Coca-Cola 600ml', 'Bebida', 6.00);
insert into Item(id_Servico, nome, tipo, preco) values (1, 'Misto Quente', 'Lanche',   15.00);
insert into Item(id_Servico, nome, tipo, preco) values (2, 'Caderno Hello Kitty 250 folhas', 'Caderno',   12.00);

select * from Servico;

#----------------

# Selecionar as Contribuições dos Usuários
select p.nome, c.informacao_alvo, c.nova_informacao from Usuario p inner join Contribuicao c on (p.ID = c.id_Usuario);
# Selecionar os Comentários de um Usuário específico
select p.nome, c.conteudo, c.avaliacao from Usuario p inner join Comentario c on (p.ID = c.id_Usuario and p.ID = 3);
# Selecionar todos as Contribuições num serviço específico
select c.informacao_alvo, c.nova_informacao from Contribuicao c where (c.id_Servico = 1);

# Pegar todos os donos de estabelecimento e admins do sistema

# Pegar todos os itens de todos servicos
select c.nome_estabelecimento, i.nome, i.tipo, i.preco from Item i inner join Servico c on (i.id_Servico = c.ID);

# Buscar de qual serviço é um item
select i.nome, s.nome_estabelecimento from Item i inner join Servico s on (s.ID = i.id_Servico) where (i.ID = 3);

# Buscar todos os serviços de uma catergoria
select s.nome_estabelecimento from Catergoria c inner join Servico s on (c.ID = s.id_Catergoria) where (c.ID = 1);
select s.nome_estabelecimento from Catergoria c inner join Servico s on (c.ID = s.id_Catergoria) where (c.ID = 2);
