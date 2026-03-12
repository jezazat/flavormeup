-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 07, 2026 at 06:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flavormeup`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(10, 52, 3, 1, '2026-03-07 17:00:11', '2026-03-07 17:00:11');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `shipping_address`, `notes`, `created_at`, `updated_at`) VALUES
(1, 51, 120.00, 'completed', 'kk', 'k', '2026-02-26 16:02:45', '2026-03-07 16:54:18'),
(3, 12, 50.00, 'completed', '1', '', '2026-03-07 16:48:56', '2026-03-07 16:54:12'),
(4, 52, 150.00, 'completed', '3', '', '2026-03-07 16:55:32', '2026-03-07 16:56:27');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(1, 1, 2, 2, 60.00, '2026-02-26 16:02:45'),
(4, 4, 16, 1, 60.00, '2026-03-07 16:55:32'),
(5, 4, 14, 1, 30.00, '2026-03-07 16:55:32'),
(6, 4, 2, 1, 60.00, '2026-03-07 16:55:32');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `image_url`, `stock`, `created_at`, `updated_at`) VALUES
(1, 'Espresso', 'ดื่มเอสเพรสโซ่ทีเดียวเหมือนโดนตบให้ตื่น', 'coffee', 50.00, 'espresso.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(2, 'Latte', 'อย่ามัวแต่ปั่นงาน มาปั่นลาเต้ก่อนมั้ย?', 'coffee', 60.00, 'latte.png', 97, '2026-02-26 15:29:58', '2026-03-07 16:55:32'),
(3, 'Mocha', 'ดื่มมอคค่าแล้วตื่นจริง แต่ตื่นมาเจองานคืออยากนอนต่อ', 'coffee', 65.00, 'mocha.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(4, 'Green Tea', 'ดื่มชาเขียวให้ใจสงบ แล้วนั่งงงกับชีวิตต่อ', 'tea', 45.00, 'greentea3.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(5, 'Thai Tea', 'ชาไทยหวานจริง ไม่ต้องเติมน้ำตาล', 'tea', 50.00, 'chaaathai.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(6, 'Lemon Tea', 'เปรี้ยวๆ สดชื่น เหมือนตอนโดนหักคะแนน', 'tea', 50.00, 'lemontea.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(7, 'Fresh Milk', 'นมสดนี่แหละตัวจริง หวานมันละลายใจ ดื่มทีเหมือนได้จุ๊บน้องวัว', 'milk', 40.00, 'milk.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(8, 'Ice Pink Milk', 'หวานเหมือนเด็ก แต่เจอเรื่องจริงก็แทบร้องไห้', 'milk', 45.00, 'pinkmilk.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(9, 'Cocoa Milk', 'โกโก้เข้มข้น แต่ชีวิตยังบางอยู่ดี', 'milk', 50.00, 'cocoa.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(10, 'Blue Hawaii Soda', 'ฟ้าสวย น้ำใส แต่ในใจยังวุ่นวายอยู่', 'soda', 55.00, 'bluesoda3.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(11, 'Peach Soda', 'ซ่าหวาน สดใส เหมือนคนที่ยังไม่โดนงานถาโถม', 'soda', 50.00, 'peachsoda.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(12, 'Strawberry Soda', 'สีหวานน่ารัก แต่พอหมดแก้วก็แค่โซดาเหมือนกัน', 'soda', 50.00, 'stsoda.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(13, 'Croissant', 'ครัวซองต์กรอบจนฟันเแทบหลุด', 'pastry', 35.00, 'croissant.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(14, 'Cookies', 'คุกกี้กัดแล้วเหมือนมีสายฟ้าผ่าลงปากกรุบและหวานพร้อมกัน', 'pastry', 30.00, 'cookies.png', 99, '2026-02-26 15:29:58', '2026-03-07 16:55:32'),
(15, 'Moji', 'ข้างในแดงฉ่ำ ข้างนอกนุ่มหยุ่น กัดทีนี่มันไฟลุก', 'pastry', 45.00, 'moji.png', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(16, 'MatchaRoll', 'กัดแล้วฟูจนหูแทบหลุด แต่ใจยังอยากกัดโรลอีก', 'pastry', 60.00, 'matcharoll.png', 99, '2026-02-26 15:29:58', '2026-03-07 16:55:32'),
(17, 'Strawberry Shortcake', 'เค้กเนื้อนุ่มกับครีมสดและสตรอเบอร์รี่สดรสหวานอมเปรี้ยวละมุนละไม 🍓', 'cake', 50.00, 'strawberryshort.jpg', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(18, 'Chocolate Cake', 'เค้กเนื้อนุ่มชุ่มฉ่ำ, ทำจากผงโกโก้หรือช็อกโกแลตแท้', 'cake', 65.00, 'cakecoco.jpg', 100, '2026-02-26 15:29:58', '2026-02-26 15:29:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(3, 'kk', 'kk@flavormeup.com', '$2b$10$ajRE6uKbPPHUFlU3UczMj.UU1Mxh20MtutkjZkOOJxKBjp5fg1moW', 'user', '2026-02-26 15:29:58', '2026-03-07 17:13:52'),
(8, 'armin', 'armin@flavormeup.com', '$2y$10$xE15fZJMwbeiLCRzwxIHx.F.7JpubF.1Sg/yzFCqz9Zv2FweyB59K', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(10, 'tub', 'tub@flavormeup.com', '$2y$10$1OBnbfFJQhBMwhN1gabdBuslDvaaEHpYnUN55v7o296d2p82jrNj6', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(12, 'admin', 'admin@flavormeup.com', '$2b$10$Iu1utNpvdW7ct2TE5UWU.eL/ScxdFPOkdJLO9vB9bQJF0yr84Oe0u', 'admin', '2026-02-26 15:29:58', '2026-03-07 16:43:53'),
(14, 'jzz', 'jzz@flavormeup.com', '$2b$10$h7FFcfIVFOBwvVWauKYeDOxOEI41sFUehY1b1500TXpAAAmkrqUp2', 'user', '2026-02-26 15:29:58', '2026-03-07 17:13:38'),
(15, 'freshy', 'freshy@flavormeup.com', '$2y$10$MSHitag79O5hEg0BXYPUzOn3oKHWd0FmBMp7dRLSCclV8487AllWW', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(21, 'jean', 'jean@flavormeup.com', '$2y$10$maqaa5aGRRV5OBO1Q4wZgeNIwjwvq3OGoLvTh4zBzVkz0jgIXz9Mm', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(22, 'gam', 'gam@flavormeup.com', '$2y$10$mkA1/DEnWVQWj8ZTcVnZduUVJCCv7Zp1Em6/uunAAfHogrZ7RWKxW', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(31, 'phuriphat', 'phuriphat@flavormeup.com', '$2b$10$nBJXvHH4NA8DPYNh4iwuiuXikd6Knd3/aAyyQUc93HNcBAxoKDA5q', 'user', '2026-02-26 15:29:58', '2026-03-07 17:13:45'),
(32, 'mhan', 'mhan@flavormeup.com', '$2y$10$ni.CrIOnj3Y2CxRm0Det2OTFeD.aL5u9SeMC6MxCkCws4XF0Nv83e', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(33, 'cn', 'cn@flavormeup.com', '$2y$10$2OL.Aj9Ors4cUz/4G5Gd9u8p58YVAsfq/8S9IXeufbSfrBhZSXFrO', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(34, 'ff', 'ff@flavormeup.com', '$2y$10$/a00bljqc4uHx6adSp3uGuEHFIHSrwf/eLV8PwP.lDjk8qaoAbU.u', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(35, 'meen', 'meen@flavormeup.com', '$2y$10$YToEhL9fg2rDYfg.Hu6HwOZ4tndUqrtD/gvj2SalPtotJ3ga5pv1W', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(36, 'gamsai', 'gamsai@flavormeup.com', '$2y$10$VucVKwXdQ5kdv/9DFUA9/.C6Ih3N2Yx6ijzo9nDpJ43EAmnXJFUeG', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(39, 'gg', 'gg@flavormeup.com', '$2b$10$.nTOlKH5OOsUBnbex2hI8.cY3wYfSpVHPTi.To4gl23DV/0gfyLMa', 'user', '2026-02-26 15:29:58', '2026-03-07 17:13:26'),
(42, 'อิน', 'in@flavormeup.com', '$2b$10$qXJ4Z3v4UfNxxBk20vxJY.nGKhxzQ8pEMRNUz554beCm5w.lsP/mC', 'user', '2026-02-26 15:29:58', '2026-03-07 17:13:29'),
(44, 'Abcc', 'abcc@flavormeup.com', '$2y$10$x3ww8C9.JT/oyk42xWOYX./r/qv9YKpSWGaXdcj5OkfRpLzw8ydh6', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(45, '👧🏻', 'girl@flavormeup.com', '$2y$10$82HPjvkH4i1EtGCcE7/8tuPyVDhJTYA3tj2T8RjIKdXVMWq5Fmx/G', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(46, 'abc', 'abc@flavormeup.com', '$2y$10$xsvdKREBwr9tjaA677162.1cs0PSirRaIBDQzMIXKeL7CXiCD9I4C', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(47, 'มีนจ้า', 'mineja@flavormeup.com', '$2y$10$0HpcL2iWrhA.l5XmB/UH0OX3aBlTmFTv5jEu5GFiIU7/1/AmQpDem', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(48, 'best', 'best@flavormeup.com', '$2y$10$NzbI9Z/eqBMYFoP6P3MLwuoiBWaMOGnKZiBKUM9L1rrGDeFFbvuC2', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(49, 'cin', 'cin@flavormeup.com', '$2y$10$gXDGyJkUR3KrRJkAXuvZrOtWmssAePdnmj0sRVsHxxt934orlEg7K', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(50, 'Wisoot', 'wisoot@flavormeup.com', '$2y$10$vGfX1XR5yBkJABQUWVYK8uah8ESSyIOoqRxaFpTpt78ArAPHv397u', 'user', '2026-02-26 15:29:58', '2026-02-26 15:29:58'),
(51, 'ke', 'jezazath0979278856@gmail.com', '$2b$10$bnrL3sieTxZkNPEUeiUqNO59g2nqAUepEeH1KlPZ3clF9OUV4/2k6', 'admin', '2026-02-26 15:31:52', '2026-02-27 04:30:40'),
(52, 'kkk', 'no@gmail.com', '$2b$10$SAt2/FvsVwxwlruLE1kyuuU6Hdna98nzuH3DC8y9wbPp9lFvU//wq', 'user', '2026-02-27 04:41:00', '2026-02-27 04:41:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
