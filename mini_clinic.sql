-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 09, 2026 at 03:35 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mini_clinic`
--

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `specialization`, `phone`, `created_at`) VALUES
(1, 'Dr. Budi Santoso', 'Dokter Umum', '081234567890', '2026-09-08 05:30:01'),
(2, 'Dr. Siti Aminah', 'Dokter Umum', '081234567891', '2026-09-08 05:30:01');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `subjective` text,
  `objective` text,
  `assessment` text,
  `plan` text,
  `medical_action` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `registration_id`, `subjective`, `objective`, `assessment`, `plan`, `medical_action`, `created_at`) VALUES
(1, 2, 'Pasien mengeluh sakit kepala sejak pagi.', 'Tekanan darah 120/80 mmHg, suhu 36.8°C.', 'Cephalgia.', 'Istirahat yang cukup dan minum obat sesuai anjuran.', NULL, '2026-09-08 05:58:04'),
(2, 3, 'Pasien mengeluh nyeri perut sejak kemarin.', 'Tekanan darah 120/80 mmHg, suhu 36.7°C.', 'Gastralgia.', 'Istirahat dan konsumsi obat sesuai anjuran.', NULL, '2026-09-08 06:47:45'),
(3, 4, 'gfgfjghdsad', 'dsfsdfsdfdsf', 'sdfsdfdsfds', 'fsdfsdfdsfsdf', NULL, '2026-09-08 08:58:34'),
(4, 6, 'dsad', 'asdas', 'dasda', 'dasd', NULL, '2026-09-09 14:02:53'),
(5, 7, 'asdasd', 'asdasd', 'asdasd', 'adasdasd', NULL, '2026-09-09 14:11:32'),
(6, 8, 'Demam dan batuk sejak 2 hari', 'Tekanan Darah: 120/80\nSuhu Tubuh: 38.2 °C\nBerat Badan: 60 kg\nTinggi Badan: 170 cm', 'ISPA', 'Istirahat dan terapi simptomatik', 'Pemeriksaan fisik umum', '2026-09-09 14:29:33'),
(7, 9, 'demam', 'Tekanan Darah: 120/80\nSuhu Tubuh: 35 °C\nBerat Badan: 72 kg\nTinggi Badan: 177 cm', 'Infeksi saluran pernapasan ringan', 'Istirahat cukup, perbanyak minum, kontrol kembali jika keluhan memburuk.', 'Pemeriksaan fisik dan edukasi pasien.', '2026-09-09 14:46:45');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `nik` varchar(16) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` enum('L','P') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `medical_record_number` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `nik`, `name`, `gender`, `date_of_birth`, `phone`, `address`, `medical_record_number`, `created_at`) VALUES
(1, '3512345678900001', 'Febrian Dwi', 'L', '2000-05-10', '08123456789', 'Sidoarjo', 'RM000001', '2026-09-07 16:39:15'),
(2, '3512345678900002', 'Billy Lukito', 'L', '2001-08-20', '08129876543', 'Surabaya', 'RM000002', '2026-09-07 16:39:15'),
(4, '3512345678900003', 'Afandidi', 'L', '1999-03-14', '08131111111', 'Surabaya', 'RM000003', '2026-09-07 17:27:54'),
(5, '3512345678900005', 'Pasien Test', 'P', '2002-01-15', '081234567890', 'Sidoarjo', 'RM000004', '2026-09-07 17:30:34'),
(8, '3512345678900008', 'Test Dokter', 'L', '2000-01-01', '081234567899', 'Surabaya', 'RM000005', '2026-09-08 06:58:18'),
(9, '3512345678900010', 'Test Petugas', 'P', '2000-01-01', '081234567890', 'Surabaya', 'RM000006', '2026-09-08 07:10:26'),
(10, '3578080702040002', 'pimennn', 'L', '2026-02-10', '08123678921222', 'jalan juwingan', 'RM000007', '2026-09-08 08:21:00'),
(11, '1234567890123456', 'abcd', 'P', '2026-09-01', '11111111111', 'aaaaaaaa', 'RM000008', '2026-09-09 14:10:00'),
(12, '1231231231231231', 'aaaa', 'L', '2026-09-01', '098721283899', 'darjo', 'RM000009', '2026-09-09 14:42:36');

-- --------------------------------------------------------

--
-- Table structure for table `polis`
--

CREATE TABLE `polis` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `polis`
--

INSERT INTO `polis` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Poli Umum', 'Pelayanan kesehatan umum', '2026-09-08 05:30:36'),
(2, 'Poli Gigi', 'Pelayanan kesehatan gigi', '2026-09-08 05:30:36'),
(3, 'Poli Anak', 'Pelayanan kesehatan anak', '2026-09-08 05:30:36');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `medicine_name` varchar(100) NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `registration_id`, `medicine_name`, `dosage`, `quantity`, `instructions`, `created_at`) VALUES
(1, 2, 'Paracetamol', '500 mg', 10, '3 kali sehari setelah makan', '2026-09-08 06:03:49'),
(2, 3, 'Paracetamol', '500 mg', 10, '3 kali sehari setelah makan', '2026-09-08 06:53:01'),
(3, 3, 'Paracetamol', '500 mg', 10, '3 kali sehari setelah makan', '2026-09-08 07:14:03'),
(4, 6, 'dasd', 'asd', 1, 'dasd', '2026-09-09 14:03:19'),
(5, 7, 'dasdasd', 'dasda', 1123, 'sadasd', '2026-09-09 14:11:47'),
(6, 8, 'Paracetamol', '500 mg', 10, '3 x sehari setelah makan', '2026-09-09 14:29:33'),
(7, 9, 'para', '50', 2, '3 x', '2026-09-09 14:46:45');

-- --------------------------------------------------------

--
-- Table structure for table `queues`
--

CREATE TABLE `queues` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `queue_number` int NOT NULL,
  `status` enum('Menunggu','Dipanggil','Selesai') DEFAULT 'Menunggu',
  `called_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `queues`
--

INSERT INTO `queues` (`id`, `registration_id`, `queue_number`, `status`, `called_at`, `created_at`) VALUES
(1, 1, 1, 'Selesai', '2026-09-08 05:51:42', '2026-09-08 05:44:53'),
(2, 2, 2, 'Selesai', '2026-09-08 08:58:53', '2026-09-08 05:48:00'),
(3, 3, 3, 'Selesai', '2026-09-08 06:41:44', '2026-09-08 06:40:42'),
(4, 4, 4, 'Selesai', '2026-09-08 08:59:25', '2026-09-08 08:59:03'),
(5, 6, 1, 'Selesai', '2026-09-09 14:02:42', '2026-09-09 14:02:21'),
(6, 7, 1, 'Selesai', '2026-09-09 14:11:55', '2026-09-09 14:09:03'),
(7, 5, 1, 'Selesai', '2026-09-09 14:27:42', '2026-09-09 14:10:30'),
(8, 9, 1, 'Selesai', '2026-09-09 14:44:16', '2026-09-09 14:43:47');

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `poli_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `initial_complaint` text,
  `status` enum('Menunggu','Check In','Pemeriksaan','Selesai') DEFAULT 'Menunggu',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `registrations`
--

INSERT INTO `registrations` (`id`, `patient_id`, `doctor_id`, `poli_id`, `visit_date`, `payment_type`, `initial_complaint`, `status`, `created_at`) VALUES
(1, 1, 1, 1, '2026-09-08', 'Umum', 'Demam dan batuk', 'Menunggu', '2026-09-08 05:38:47'),
(2, 2, 1, 1, '2026-09-08', 'Umum', 'Sakit kepala', 'Pemeriksaan', '2026-09-08 05:47:29'),
(3, 1, 1, 1, '2026-09-08', 'BPJS', 'Nyeri perut sejak kemarin', 'Pemeriksaan', '2026-09-08 06:35:01'),
(4, 10, 2, 1, '2026-09-08', 'Umum', 'wdasd', 'Pemeriksaan', '2026-09-08 08:54:15'),
(5, 10, 2, 2, '2026-09-04', 'BPJS', 'adsfaadsf', 'Check In', '2026-09-09 13:40:35'),
(6, 4, 2, 3, '2026-09-12', 'BPJS', 'aaa', 'Pemeriksaan', '2026-09-09 13:55:50'),
(7, 1, 2, 1, '2026-08-31', 'Umum', 'a', 'Selesai', '2026-09-09 14:07:49'),
(8, 11, 1, 1, '2026-08-31', 'Umum', 'zx', 'Selesai', '2026-09-09 14:27:31'),
(9, 12, 1, 1, '2026-09-08', 'Umum', 'demam', 'Selesai', '2026-09-09 14:43:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('Administrator','Dokter','Petugas Pendaftaran') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$10$WvkA3YKveCtn.wKFVdeDmeR9N/0QAGzwA/bWJ6PggUI3mvfslckVW', 'Administrator', 'Administrator', '2026-09-08 06:09:32'),
(2, 'dokter', '$2b$10$AggP2I6uyetSsnEl9y/pJe8bV1jJYdOhvykPVS8RlDC2maycgXPjy', 'Dr. Budi Santoso', 'Dokter', '2026-09-08 06:57:23'),
(3, 'pimen1', '$2b$10$qwjmdofs4DkjS9njy5B3q.qtXVzwtDzQSGx50wkg48uSP2.2ezhwq', 'Pimen', 'Petugas Pendaftaran', '2026-09-08 07:06:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD UNIQUE KEY `medical_record_number` (`medical_record_number`);

--
-- Indexes for table `polis`
--
ALTER TABLE `polis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `queues`
--
ALTER TABLE `queues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `poli_id` (`poli_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `polis`
--
ALTER TABLE `polis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `queues`
--
ALTER TABLE `queues`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `queues`
--
ALTER TABLE `queues`
  ADD CONSTRAINT `queues_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  ADD CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`poli_id`) REFERENCES `polis` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
