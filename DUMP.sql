-- MariaDB dump 10.19-11.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: serviços
-- ------------------------------------------------------
-- Server version	11.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `serviços`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `serviços` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `serviços`;

--
-- Table structure for table `Catergoria`
--

DROP TABLE IF EXISTS `Catergoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Catergoria` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Catergoria`
--

LOCK TABLES `Catergoria` WRITE;
/*!40000 ALTER TABLE `Catergoria` DISABLE KEYS */;
INSERT INTO `Catergoria` VALUES
(1,'Lanchonete'),
(2,'Loja'),
(4,'Atelier');
/*!40000 ALTER TABLE `Catergoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_Servico` int(11) DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `tipo` varchar(256) DEFAULT NULL,
  `preco` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `id_Servico` (`id_Servico`),
  CONSTRAINT `Item_ibfk_1` FOREIGN KEY (`id_Servico`) REFERENCES `Servico` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Item`
--

LOCK TABLES `Item` WRITE;
/*!40000 ALTER TABLE `Item` DISABLE KEYS */;
INSERT INTO `Item` VALUES
(1,1,'Sprite Zero 600ml','Bebida',6.00),
(2,1,'Misto Quente','Lanche',15.00),
(3,2,'Caderno Hello Kitty 250 folhas','Caderno',12.00),
(8,4,'Vara Mágica','Ferramenta Mágica',55.90);
/*!40000 ALTER TABLE `Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Servico`
--

DROP TABLE IF EXISTS `Servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Servico` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_Catergoria` int(11) DEFAULT NULL,
  `id_Dono` int(11) DEFAULT NULL,
  `nome_estabelecimento` varchar(256) NOT NULL,
  `nome_dono_anonimo` varchar(256) DEFAULT NULL,
  `horario_aberto` time DEFAULT NULL,
  `horario_fechado` time DEFAULT NULL,
  `horario_pico` time DEFAULT NULL,
  `local_bloco` char(2) DEFAULT NULL,
  `local_sala` int(11) DEFAULT NULL,
  `local_complemento` varchar(256) DEFAULT NULL,
  `local_pos_x` double DEFAULT NULL,
  `local_pos_y` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `id_Catergoria` (`id_Catergoria`),
  KEY `id_Dono` (`id_Dono`),
  CONSTRAINT `Servico_ibfk_1` FOREIGN KEY (`id_Catergoria`) REFERENCES `Catergoria` (`ID`),
  CONSTRAINT `Servico_ibfk_2` FOREIGN KEY (`id_Dono`) REFERENCES `Usuario` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Servico`
--

LOCK TABLES `Servico` WRITE;
/*!40000 ALTER TABLE `Servico` DISABLE KEYS */;
INSERT INTO `Servico` VALUES
(1,1,3,'Tentação do Mate',NULL,'12:00:00','22:00:00','18:45:00','B5',407,'Próximo à biblioteca',2043.65,723.23),
(2,2,NULL,'Loja do Cláudio','Cláudio','15:00:00','21:30:00','18:00:00','C3',102,NULL,1853.32,2353.6),
(4,4,NULL,'O Magistrado','Rosemary Lucius',NULL,'19:47:00',NULL,'D3',201,'Próximo à loja de magia',NULL,NULL);
/*!40000 ALTER TABLE `Servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuario`
--

DROP TABLE IF EXISTS `Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Usuario` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `senha` char(128) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuario`
--

LOCK TABLES `Usuario` WRITE;
/*!40000 ALTER TABLE `Usuario` DISABLE KEYS */;
INSERT INTO `Usuario` VALUES
(1,'Josefino Amarildo','josesinho@gmail.com','1d9aca83b145944e6ddf3991196c3cdde99ed626e49770f12b8f69674005bb9b',0),
(2,'Rebecca dos Santos','rebecca@outlook.com','12de7648dd8e95e9d817ad08cf2b911b12073e304d7de18f2cbcc890548d72ca',1),
(3,'Mario Luigi','mario@hotmail.com','2319dced3396e51e553083d1673f1014c9e93465a86cfac4c656b953bcc7ac52',0);
/*!40000 ALTER TABLE `Usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-04 16:20:46
