-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        8.0.23 - MySQL Community Server - GPL
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 导出 bfban_2.0 的数据库结构
CREATE DATABASE IF NOT EXISTS `bfban_2.0` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bfban_2.0`;

-- 导出  表 bfban_2.0.ban_appeals 结构
CREATE TABLE IF NOT EXISTS `ban_appeals` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `toCheaterId` int unsigned DEFAULT NULL,
  `byUserId` int unsigned DEFAULT NULL,
  `content` text NOT NULL,
  `valid` tinyint unsigned NOT NULL DEFAULT '1',
  `viewedAdminIds` varchar(128) NOT NULL DEFAULT '',
  `status` varchar(16) DEFAULT 'open',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `toCheaterId` (`toCheaterId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.judgements 结构
CREATE TABLE IF NOT EXISTS `judgements` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `valid` tinyint unsigned NOT NULL DEFAULT '1',
  `byUserId` int unsigned DEFAULT NULL,
  `toPlayerId` int unsigned NOT NULL,
  `toOriginUserId` varchar(20) DEFAULT NULL,
  `cheatMethods` varchar(400) DEFAULT '',
  `action` varchar(20) DEFAULT NULL,
  `content` text,
  `createTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `toOriginUserId` (`toOriginUserId`) USING BTREE,
  KEY `toCheaterId` (`toPlayerId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.message 结构
CREATE TABLE IF NOT EXISTS `message` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `byUserId` int unsigned DEFAULT NULL,
  `toUserId` int unsigned DEFAULT NULL,
  `refer` varchar(256) DEFAULT '',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `content` varchar(512) NOT NULL DEFAULT '',
  `haveRead` int unsigned NOT NULL DEFAULT '0',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `toUserId` (`toUserId`) USING BTREE,
  KEY `byUserId` (`byUserId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.name_log 结构
CREATE TABLE IF NOT EXISTS `name_log` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `originName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `originUserId` varchar(20) DEFAULT NULL,
  `originPersonaId` varchar(20) DEFAULT NULL,
  `fromTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `toTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `originUserId` (`originUserId`) USING BTREE,
  KEY `originUserName` (`originName`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.players 结构
CREATE TABLE IF NOT EXISTS `players` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `originName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `originUserId` varchar(20) DEFAULT NULL,
  `originPersonaId` varchar(20) DEFAULT NULL,
  `games` varchar(50) DEFAULT '',
  `cheatMethods` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '',
  `avatarLink` varchar(256) DEFAULT '',
  `viewNum` int unsigned NOT NULL DEFAULT '0',
  `commentsNum` int unsigned NOT NULL DEFAULT '0',
  `valid` tinyint unsigned NOT NULL DEFAULT '1',
  `status` int DEFAULT NULL COMMENT '0未处理，1实锤，2嫌疑，3清白，4无效，5讨论，6待锤',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `originUserId` (`originUserId`) USING BTREE,
  KEY `originPersonaId` (`originPersonaId`) USING BTREE,
  KEY `originId` (`originName`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.registers 结构
CREATE TABLE IF NOT EXISTS `registers` (
  `username` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `uniqCode` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `originName` varchar(64) DEFAULT NULL,
  `originEmail` varchar(256) DEFAULT NULL,
  `originPersonaId` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `originUserId` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `expiresTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`username`) USING BTREE,
  UNIQUE KEY `uniq_code` (`uniqCode`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  事件 bfban_2.0.remove_expired_captchas 结构
DELIMITER //
CREATE EVENT `remove_expired_captchas` ON SCHEDULE EVERY 30 MINUTE STARTS '2021-07-01 15:56:03' ON COMPLETION PRESERVE ENABLE COMMENT 'Remove expired captchas to free space' DO BEGIN
	DELETE FROM `used_captchas` WHERE `expiresTime` <= CURRENT_TIMESTAMP();
END//
DELIMITER ;

-- 导出  事件 bfban_2.0.remove_expired_registration 结构
DELIMITER //
CREATE EVENT `remove_expired_registration` ON SCHEDULE EVERY 30 MINUTE STARTS '2021-07-01 15:59:44' ON COMPLETION PRESERVE ENABLE COMMENT 'Remove expired registration' DO BEGIN
	DELETE FROM `registers` WHERE `expiresTime` <= CURRENT_TIMESTAMP();
END//
DELIMITER ;

-- 导出  表 bfban_2.0.replies 结构
CREATE TABLE IF NOT EXISTS `replies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `toPlayerId` int unsigned DEFAULT NULL,
  `byUserId` int unsigned DEFAULT NULL,
  `toCommentType` int DEFAULT NULL,
  `toCommentId` int unsigned DEFAULT NULL,
  `content` text NOT NULL,
  `valid` tinyint unsigned NOT NULL DEFAULT '1',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `toCheaterId` (`toPlayerId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.reports 结构
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `byUserId` int unsigned DEFAULT NULL,
  `toOriginName` varchar(64) DEFAULT NULL,
  `toPlayerId` int unsigned DEFAULT NULL,
  `toOriginUserId` varchar(20) DEFAULT NULL,
  `toOriginPersonaId` varchar(20) DEFAULT NULL,
  `game` varchar(8) DEFAULT '',
  `cheatMethods` varchar(400) DEFAULT '',
  `videoLink` varchar(400) DEFAULT '',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `valid` tinyint unsigned NOT NULL DEFAULT '1',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `toOriginUserId` (`toOriginUserId`) USING BTREE,
  KEY `toOriginPersonaId` (`toOriginPersonaId`) USING BTREE,
  KEY `toCheaterId` (`toPlayerId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.used_captchas 结构
CREATE TABLE IF NOT EXISTS `used_captchas` (
  `uniqHash` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expiresTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uniqHash`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

-- 导出  表 bfban_2.0.users 结构
CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `password` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `introduction` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '',
  `vaild` tinyint NOT NULL DEFAULT '1',
  `privilege` varchar(40) NOT NULL DEFAULT '',
  `attr` text,
  `originName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `originUserId` varchar(20) DEFAULT NULL,
  `originPersonaId` varchar(20) DEFAULT NULL,
  `originEmail` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `signoutTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE,
  KEY `originUserId` (`originUserId`) USING BTREE,
  KEY `originPersonaId` (`originPersonaId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
