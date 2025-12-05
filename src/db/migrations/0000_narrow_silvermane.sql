CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`color` text NOT NULL,
	`emoji` text NOT NULL,
	`currencyId` integer NOT NULL,
	FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`start` integer NOT NULL,
	`end` integer,
	`period` text NOT NULL,
	`color` text NOT NULL,
	`emoji` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`emoji` text NOT NULL,
	`parentCategoryId` integer,
	FOREIGN KEY (`parentCategoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `categories_to_budgets` (
	`budgetId` integer NOT NULL,
	`categoryId` integer NOT NULL,
	PRIMARY KEY(`budgetId`, `categoryId`),
	FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categoryTerms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`term` text NOT NULL,
	`categoryId` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categoryTerms_term_categoryId_unique` ON `categoryTerms` (`term`,`categoryId`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactionGroups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text,
	`note` text,
	`date` integer NOT NULL,
	`accountId` integer NOT NULL,
	`imagePath` text,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`categoryTermId` integer NOT NULL,
	`transactionGroupId` integer NOT NULL,
	FOREIGN KEY (`categoryTermId`) REFERENCES `categoryTerms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transactionGroupId`) REFERENCES `transactionGroups`(`id`) ON UPDATE no action ON DELETE cascade
);
