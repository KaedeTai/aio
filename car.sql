CREATE DATABASE car;
USE car;

CREATE TABLE `brand` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `car` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `brand_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `brand` (`id`, `name`) VALUES
(1, 'Nissan'),
(2, 'Toyota');

INSERT INTO `car` (`id`, `name`, `brand_id`) VALUES
(1, 'March', 1),
(2, 'Altis', 2);

