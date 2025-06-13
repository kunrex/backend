-- MySQL dump 10.13  Distrib 9.3.0, for macos14.7 (x86_64)
--
-- Host: localhost    Database: backend
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(300) NOT NULL,
  `veg` tinyint(1) NOT NULL,
  `cookTime` time NOT NULL,
  `price` int unsigned NOT NULL,
  `image` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
INSERT INTO `foods` VALUES (1,'Paneer Butter Masala','Creamy tomato-based curry with soft paneer cubes.',1,'00:30:00',180,'foods/Paneer Butter Masala.jpeg'),(2,'Chicken Biryani','Aromatic rice dish layered with spiced chicken.',0,'01:00:00',250,'foods/Chicken Biryani.jpeg'),(3,'Masala Dosa','Crispy rice crepe filled with spiced potato mash.',1,'00:25:00',100,'foods/Masala Dosa.jpeg'),(4,'Rogan Josh','Kashmiri-style mutton curry rich in spices.',0,'01:10:00',300,'foods/Rogan Josh.jpeg'),(5,'Chole Bhature','Spicy chickpeas served with fluffy fried bread.',1,'00:35:00',120,'foods/Chole Bhature.jpeg'),(6,'Fish Curry','Coastal-style fish curry in tangy coconut gravy.',0,'00:45:00',220,'foods/Fish Curry.jpeg'),(7,'Palak Paneer','Spinach puree cooked with paneer cubes and spices.',1,'00:30:00',160,'foods/Palak Paneer.jpeg'),(8,'Butter Chicken','Rich and creamy tomato-based chicken curry.',0,'00:50:00',240,'foods/Butter Chicken.jpeg'),(9,'Aloo Paratha','Stuffed wheat flatbread with spicy potato filling.',1,'00:20:00',80,'foods/Aloo Paratha.jpeg'),(10,'Mutton Korma','Slow-cooked mutton curry in creamy spiced gravy.',0,'01:20:00',320,'foods/Mutton Korma.jpeg'),(11,'Rajma Chawal','Kidney beans curry served with steamed rice.',1,'00:40:00',130,'foods/Rajma Chawal.jpeg'),(12,'Tandoori Chicken','Yogurt-marinated grilled chicken with spices.',0,'00:50:00',200,'foods/Tandoori Chicken.jpeg'),(13,'Veg Pulao','Fragrant rice cooked with vegetables and spices.',1,'00:25:00',110,'foods/Veg Pulao.jpeg'),(14,'Keema Pav','Minced meat curry served with buttered bread.',0,'00:35:00',150,'foods/Keema Pav.jpeg'),(15,'Dhokla','Steamed savory cake made from fermented batter.',1,'00:30:00',90,'foods/Dhokla.jpeg'),(16,'Egg Curry','Boiled eggs simmered in spiced onion-tomato gravy.',0,'00:35:00',140,'foods/Egg Curry.jpeg'),(17,'Baingan Bharta','Smoky mashed eggplant cooked with spices.',1,'00:30:00',100,'foods/Baingan Bharta.jpeg'),(18,'Hyderabadi Biryani','Dum-cooked biryani with marinated mutton.',0,'01:15:00',280,'foods/Hyderabadi Biryani.jpeg'),(19,'Kadhi Pakora','Spiced yogurt gravy with gram flour dumplings.',1,'00:45:00',120,'foods/Kadhi Pakora.jpeg'),(20,'Prawn Masala','Juicy prawns cooked in spicy coastal masala.',0,'00:40:00',260,'foods/Prawn Masala.jpeg'),(21,'Virgin Mojito','Refreshing non-alcoholic version of the classic mojito, made with fresh mint, lime, and sparkling water.',1,'00:00:00',200,'foods/Virgin Mojito.jpeg');
/*!40000 ALTER TABLE `foods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FoodTagRelations`
--

DROP TABLE IF EXISTS `FoodTagRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FoodTagRelations` (
  `foodId` bigint NOT NULL,
  `tagId` bigint NOT NULL,
  KEY `foodId` (`foodId`),
  KEY `tagId` (`tagId`),
  CONSTRAINT `foodtagrelations_ibfk_1` FOREIGN KEY (`foodId`) REFERENCES `Foods` (`id`),
  CONSTRAINT `foodtagrelations_ibfk_2` FOREIGN KEY (`tagId`) REFERENCES `FoodTags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FoodTagRelations`
--

LOCK TABLES `FoodTagRelations` WRITE;
/*!40000 ALTER TABLE `FoodTagRelations` DISABLE KEYS */;
INSERT INTO `FoodTagRelations` VALUES (1,3),(3,2),(3,5),(4,3),(5,3),(6,3),(6,4),(7,3),(8,3),(9,2),(10,3),(11,1),(11,3),(12,2),(13,1),(14,3),(15,2),(16,3),(17,3),(18,1),(18,3),(19,3),(20,3),(20,4),(2,1),(21,6);
/*!40000 ALTER TABLE `FoodTagRelations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foodtags`
--

DROP TABLE IF EXISTS `foodtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodtags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foodtags`
--

LOCK TABLES `foodtags` WRITE;
/*!40000 ALTER TABLE `foodtags` DISABLE KEYS */;
INSERT INTO `foodtags` VALUES (3,'curries'),(6,'drinks'),(1,'rice'),(4,'seafood'),(5,'south indian'),(2,'starters');
/*!40000 ALTER TABLE `foodtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Orders`
--