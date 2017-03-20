CREATE DATABASE car;
USE car;

CREATE TABLE `brand` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `car` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `brand_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `brand`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `car`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_id` (`brand_id`);

INSERT INTO `brand` (`id`, `name`) VALUES
(1, 'Nissan'),
(2, 'Toyota');

INSERT INTO `car` (`id`, `name`, `brand_id`) VALUES
(1, 'March', 1),
(2, 'Altis', 2);

