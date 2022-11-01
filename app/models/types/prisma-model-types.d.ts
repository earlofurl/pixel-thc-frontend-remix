/**
 * Model User
 *
 */
export type User = {
	id: string
	email: string
	createdAt: Date
	updatedAt: Date
}

/**
 * Model ProductCategory
 *
 */
export type ProductCategory = {
	id: string
	name: string
}

/**
 * Model Strain
 *
 */
export type Strain = {
	id: string
	name: string
	type: string
	createdAt: Date
	updatedAt: Date
	yield_average: number
	terp_average_total: number
	terp_1: string
	terp_1_value: number
	terp_2: string
	terp_2_value: number
	terp_3: string
	terp_3_value: number
	terp_4: string
	terp_4_value: number
	terp_5: string
	terp_5_value: number
	thc_average: number
	total_cannabinoid_average: number
	light_dep_2022: Availability
	fall_harvest_2022: Availability
	quantity_available: number
}

/**
 * Model Location
 *
 */
export type Location = {
	id: string
	createdAt: Date
	updatedAt: Date
	name: string
	address: string
	city: string
	state: string
	zip: string
	latitude: number
	longitude: number
	note: string
	website: string | null
	flower: boolean
	prerolls: boolean
	pressed_hash: boolean
	created_by: string
}

/**
 * Model Item
 *
 */
export type Item = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	description: string | null
	isUsed: boolean | null
	itemTypeId: string | null
	itemType: ItemType | null
	strainId: string | null
	strain: Strain | null
}

/**
 * Model ItemType
 *
 */
export type ItemType = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	productForm: string | null
	productModifier: string | null
	uomDefaultId: string | null
	productCategoryId: string | null
}

/**
 * Model PackageTag
 *
 */
export type PackageTag = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	tagNumber: string
	isAssigned: boolean | null
	isProvisional: boolean | null
	isActive: boolean | null
}

/**
 * Model Package
 *
 */
export type Package = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	tagId: string | null
	packageType: PackageType
	quantity: number | null
	notes: string | null
	packagedDateTime: Date | null
	harvestDateTime: Date | null
	labTestingState: LabTestingState | null
	labTestingStateDate: Date | null
	isTradeSample: boolean | null
	isTestingSample: boolean | null
	productRequiresRemediation: boolean | null
	containsRemediatedProduct: boolean | null
	remediationDate: Date | null
	receivedDateTime: Date | null
	receivedFromManifestNumber: string | null
	receivedFromFacilityLicenseNumber: string | null
	receivedFromFacilityName: string | null
	isOnHold: boolean | null
	archivedDate: Date | null
	finishedDate: Date | null
	itemId: string | null
	provisionalLabel: string | null
	isProvisional: boolean | null
	isSold: boolean | null
	ppuDefault: number | null
	ppuOnOrder: number | null
	totalPackagePriceOnOrder: number | null
	ppuSoldPrice: number | null
	totalSoldPrice: number | null
	packagingSuppliesConsumed: boolean | null
	isLineItem: boolean | null
	orderId: string | null
	uomId: string | null
}

/**
 * Model LabTest
 *
 */
export type LabTest = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	testName: string | null
	batchCode: string | null
	testIdCode: string | null
	labFacilityName: string | null
	testPerformedDate: Date | null
	overallPassed: boolean | null
	testTypeName: string | null
	testPassed: boolean | null
	testComment: string | null
	thcTotalPercent: number | null
	cbdPercent: number | null
	terpenePercent: number | null
	thcAPercent: number | null
	delta9ThcPercent: number | null
	delta8ThcPercent: number | null
	thcVPercent: number | null
	cbdAPercent: number | null
	cbnPercent: number | null
	cbgAPercent: number | null
	cbgPercent: number | null
	cbcPercent: number | null
	totalCannabinoidsPercent: number | null
}

/**
 * Model LabTestsOnPackages
 *
 */
export type LabTestsOnPackages = {
	labTestId: string
	packageId: string
	assignedAt: Date
	assignedBy: string | null
}

/**
 * Model Uom
 *
 */
export type Uom = {
	id: string
	createdAt: Date | null
	quantityType: QuantityType
	name: string | null
	abbreviation: string | null
}

/**
 * Model Order
 *
 */
export type Order = {
	id: string
	createdAt: Date | null
	updatedAt: Date | null
	scheduledPackDateTime: Date | null
	scheduledShipDateTime: Date | null
	scheduledDeliveryDateTime: Date | null
	actualPackDateTime: Date | null
	actualShipDateTime: Date | null
	actualDeliveryDateTime: Date | null
	orderTotal: number | null
	notes: string | null
	status: OrderStatus
	customerName: string | null
}

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const Availability: {
	TRUE: 'TRUE'
	FALSE: 'FALSE'
	SOLD_OUT: 'SOLD_OUT'
}

export type Availability = typeof Availability[keyof typeof Availability]

export const LabTestingState: {
	NotSubmitted: 'NotSubmitted'
	SubmittedForTesting: 'SubmittedForTesting'
	TestPassed: 'TestPassed'
	TestFailed: 'TestFailed'
}

export type LabTestingState =
	typeof LabTestingState[keyof typeof LabTestingState]

export const OrderStatus: {
	Open: 'Open'
	Packed: 'Packed'
	Shipped: 'Shipped'
	Delivered: 'Delivered'
	Cancelled: 'Cancelled'
	Paid: 'Paid'
	Finished: 'Finished'
}

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

export const PackageType: {
	Product: 'Product'
	ImmaturePlant: 'ImmaturePlant'
	VegetativePlant: 'VegetativePlant'
	PlantWaste: 'PlantWaste'
	HarvestWaste: 'HarvestWaste'
}

export type PackageType = typeof PackageType[keyof typeof PackageType]

export const QuantityType: {
	CountBased: 'CountBased'
	WeightBased: 'WeightBased'
}

export type QuantityType = typeof QuantityType[keyof typeof QuantityType]
