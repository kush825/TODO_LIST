-- CreateTable
CREATE TABLE `projects` (
    `ProjectID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProjectName` VARCHAR(100) NOT NULL,
    `Description` VARCHAR(255) NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Background` VARCHAR(255) NULL,

    INDEX `CreatedBy`(`CreatedBy`),
    PRIMARY KEY (`ProjectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `RoleID` INTEGER NOT NULL AUTO_INCREMENT,
    `RoleName` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `RoleName`(`RoleName`),
    PRIMARY KEY (`RoleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskcomments` (
    `CommentID` INTEGER NOT NULL AUTO_INCREMENT,
    `TaskID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `CommentText` VARCHAR(255) NOT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `TaskID`(`TaskID`),
    INDEX `UserID`(`UserID`),
    PRIMARY KEY (`CommentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskhistory` (
    `HistoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `TaskID` INTEGER NOT NULL,
    `ChangedBy` INTEGER NOT NULL,
    `ChangeType` VARCHAR(50) NOT NULL,
    `ChangeTime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ChangedBy`(`ChangedBy`),
    INDEX `TaskID`(`TaskID`),
    PRIMARY KEY (`HistoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasklists` (
    `ListID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProjectID` INTEGER NOT NULL,
    `ListName` VARCHAR(100) NOT NULL,

    INDEX `ProjectID`(`ProjectID`),
    PRIMARY KEY (`ListID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `TaskID` INTEGER NOT NULL AUTO_INCREMENT,
    `ListID` INTEGER NOT NULL,
    `AssignedTo` INTEGER NULL,
    `Title` VARCHAR(100) NOT NULL,
    `Description` VARCHAR(255) NULL,
    `Priority` VARCHAR(10) NULL,
    `Status` VARCHAR(20) NULL,
    `DueDate` DATE NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `UpdatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `AssignedTo`(`AssignedTo`),
    INDEX `ListID`(`ListID`),
    PRIMARY KEY (`TaskID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userroles` (
    `UserRoleID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `RoleID` INTEGER NOT NULL,

    INDEX `RoleID`(`RoleID`),
    UNIQUE INDEX `UserID`(`UserID`, `RoleID`),
    PRIMARY KEY (`UserRoleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserName` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ProfileImage` VARCHAR(255) NULL,

    UNIQUE INDEX `UserName`(`UserName`),
    UNIQUE INDEX `Email`(`Email`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otps` (
    `OTPID` INTEGER NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(100) NOT NULL,
    `Code` VARCHAR(255) NOT NULL,
    `ExpiresAt` DATETIME(0) NOT NULL,
    `CreatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Email`(`Email`),
    PRIMARY KEY (`OTPID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`CreatedBy`) REFERENCES `users`(`UserID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taskcomments` ADD CONSTRAINT `taskcomments_ibfk_1` FOREIGN KEY (`TaskID`) REFERENCES `tasks`(`TaskID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taskcomments` ADD CONSTRAINT `taskcomments_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taskhistory` ADD CONSTRAINT `taskhistory_ibfk_1` FOREIGN KEY (`TaskID`) REFERENCES `tasks`(`TaskID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taskhistory` ADD CONSTRAINT `taskhistory_ibfk_2` FOREIGN KEY (`ChangedBy`) REFERENCES `users`(`UserID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tasklists` ADD CONSTRAINT `tasklists_ibfk_1` FOREIGN KEY (`ProjectID`) REFERENCES `projects`(`ProjectID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`ListID`) REFERENCES `tasklists`(`ListID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`AssignedTo`) REFERENCES `users`(`UserID`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userroles` ADD CONSTRAINT `userroles_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userroles` ADD CONSTRAINT `userroles_ibfk_2` FOREIGN KEY (`RoleID`) REFERENCES `roles`(`RoleID`) ON DELETE CASCADE ON UPDATE NO ACTION;
