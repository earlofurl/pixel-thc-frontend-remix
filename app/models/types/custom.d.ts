import type {
	Package,
	LabTestsOnPackages,
	Item,
	ItemType,
	PackageTag,
	Strain,
	Uom,
} from './prisma-model-types'

export type PackageWithNestedData = Package & {
	tag: PackageTag
	item: ItemWithNesting
	labTests: LabTestsOnPackages[]
	uom: Uom
	sourcePackages: PackageWithNestedData[]
}

export type ItemWithNesting = Item & {
	itemType: ItemType
	strain: Strain
}

export enum Role {
	'admin' = 'ADMIN',
	'customer' = 'CUSTOMER',
	'guest' = 'GUEST',
	'standard' = 'STANDARD',
	'superadmin' = 'SUPERADMIN',
	'manager' = 'MANAGER',
}
