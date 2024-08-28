-- CreateTable
CREATE TABLE "clinics" (
    "idClinic" SERIAL NOT NULL,
    "clinicSlug" TEXT NOT NULL,
    "nameClinic" TEXT NOT NULL,
    "logoClinic" TEXT,
    "address" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "codeClinic" TEXT,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("idClinic")
);

-- CreateTable
CREATE TABLE "users" (
    "idUser" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "idClinic" INTEGER NOT NULL,
    "profileImg" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "patients" (
    "idPatient" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "how_know_us" TEXT NOT NULL,
    "idClinic" INTEGER NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("idPatient")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "idSymptom" SERIAL NOT NULL,
    "uncomfortableAreas" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "discomforts" TEXT[],
    "frequency" TEXT NOT NULL,
    "discomfortIncreases" TEXT[],
    "discomfortDecreases" TEXT[],
    "geralState" TEXT[],
    "headNeck" TEXT[],
    "thoraxRespiratory" TEXT[],
    "cardioVascular" TEXT[],
    "gastroIntestinal" TEXT[],
    "genitoUrinary" TEXT[],
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("idSymptom")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "idMedicalRecord" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "observations" TEXT,
    "subjectiveEvaluation" TEXT,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("idMedicalRecord")
);

-- CreateTable
CREATE TABLE "documents" (
    "idDocuments" SERIAL NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "nameImagesEvaluation" TEXT[],
    "imagesEvaluation" TEXT[],
    "examsName" TEXT[],
    "exams" TEXT[],

    CONSTRAINT "documents_pkey" PRIMARY KEY ("idDocuments")
);

-- CreateTable
CREATE TABLE "services" (
    "idService" SERIAL NOT NULL,
    "nameService" TEXT NOT NULL,
    "dateService" TEXT NOT NULL,
    "adjustmentAreas" TEXT[],
    "descriptionService" TEXT NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("idService")
);

-- CreateTable
CREATE TABLE "calendars" (
    "IdConsult" SERIAL NOT NULL,
    "patientName" TEXT NOT NULL,
    "dateForListing" TEXT NOT NULL,
    "dateConsult" TEXT NOT NULL,
    "hourConsult" TEXT NOT NULL,
    "consultType" TEXT NOT NULL,
    "qntReturns" INTEGER,
    "currentReturn" INTEGER,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "idClinic" INTEGER NOT NULL,
    "patientId" INTEGER,
    "professionalId" INTEGER NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("IdConsult")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "isUseful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_clinicSlug_key" ON "clinics"("clinicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_cpfCnpj_key" ON "clinics"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_patientId_key" ON "medical_records"("patientId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_idClinic_fkey" FOREIGN KEY ("idClinic") REFERENCES "clinics"("idClinic") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_idClinic_fkey" FOREIGN KEY ("idClinic") REFERENCES "clinics"("idClinic") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("idPatient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("idPatient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("idMedicalRecord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("idMedicalRecord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("idPatient") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_idClinic_fkey" FOREIGN KEY ("idClinic") REFERENCES "clinics"("idClinic") ON DELETE RESTRICT ON UPDATE CASCADE;
