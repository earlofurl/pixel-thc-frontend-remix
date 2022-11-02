import type { Uom } from '~/models/types/prisma-model-types'
import type {
	PackageWithNestedData,
	ItemWithNesting,
} from '~/models/types/custom'

// General Weight Unit Conversions
// convert grams to pounds
export const gramsToPounds = (grams: number) => {
	return grams / 453.592
}

// convert pounds to grams
export const poundsToGrams = (pounds: number) => {
	return pounds / 0.00220462
}

// convert grams to ounces
export const gramsToOunces = (grams: number) => {
	return grams / 28.3495
}

// convert ounces to grams
export const ouncesToGrams = (ounces: number) => {
	return ounces / 0.035274
}

// convert pounds to ounces
export const poundsToOunces = (pounds: number) => {
	return pounds / 0.0625
}

// convert ounces to pounds
export const ouncesToPounds = (ounces: number) => {
	return ounces / 16
}

// convert grams to kilograms
export const gramsToKilograms = (grams: number) => {
	return grams * 1000
}

// convert kilograms to grams
export const kilogramsToGrams = (kilograms: number) => {
	return kilograms / 1000
}

// convert pounds to kilograms
export const poundsToKilograms = (pounds: number) => {
	return pounds / 2.20462
}

// convert kilograms to pounds
export const kilogramsToPounds = (kilograms: number) => {
	return kilograms * 2.20462
}

// convert ounces to kilograms
export const ouncesToKilograms = (ounces: number) => {
	return ounces / 35.274
}

// convert kilograms to ounces
export const kilogramsToOunces = (kilograms: number) => {
	return kilograms * 35.274
}

// Product specific conversions
// convert single to two-pack
export const singleToTwoPack = (single: number) => {
	return single / 2
}

// convert single to ten-pack
export const singleToTenPack = (single: number) => {
	return single / 10
}

// convert two-pack to single
export const twoPackToSingle = (twoPack: number) => {
	return twoPack * 2
}

// convert two-pack to ten-pack
export const twoPackToTenPack = (twoPack: number) => {
	return twoPack / 5
}

// convert ten-pack to single
export const tenPackToSingle = (tenPack: number) => {
	return tenPack * 10
}

// convert ten-pack to double
export const tenPackToTwoPack = (tenPack: number) => {
	return tenPack * 5
}

export const packageUnitConverter = (
	parentPackage: PackageWithNestedData,
	selectedItem: ItemWithNesting,
	selectedUom: Uom,
	childQuantity: number,
) => {
	const parentUom = parentPackage.uom
	const parentQuantity = parentPackage.quantity
	const childUom = selectedUom
	let convertedQuantity = 0

	switch (parentUom.name.toLowerCase()) {
		case 'grams': {
			switch (childUom.name.toLowerCase()) {
				case 'grams':
					convertedQuantity = childQuantity
					break
				case 'pounds':
					convertedQuantity = poundsToGrams(childQuantity)
					break
				case 'ounces':
					convertedQuantity = ouncesToGrams(childQuantity)
					break
				case 'kilograms':
					convertedQuantity = kilogramsToGrams(childQuantity)
					break
				case 'each':
					switch (selectedItem.itemType.productForm.toLowerCase()) {
						case 'preroll':
							switch (selectedItem.itemType.productModifier.toLowerCase()) {
								case 'single':
									convertedQuantity = childQuantity * 0.5
									break
								case 'twopack':
									convertedQuantity = childQuantity
									break
								case '10-pack':
									convertedQuantity = childQuantity * 5
									break
							}
							break
					}
					break
			}
			break
		}
		case 'ounces':
			switch (childUom.name.toLowerCase()) {
				case 'ounces':
					convertedQuantity = childQuantity
					break
				case 'pounds':
					convertedQuantity = poundsToOunces(childQuantity)
					break
				case 'grams':
					convertedQuantity = gramsToOunces(childQuantity)
					break
				case 'kilograms':
					convertedQuantity = kilogramsToOunces(childQuantity)
					break
				case 'each':
					switch (selectedItem.itemType.productForm.toLowerCase()) {
						case 'preroll':
							switch (selectedItem.itemType.productModifier.toLowerCase()) {
								case 'single':
									convertedQuantity = gramsToOunces(childQuantity * 0.5)
									break
								case 'twopack':
									convertedQuantity = gramsToOunces(childQuantity)
									break
								case '10-pack':
									convertedQuantity = gramsToOunces(childQuantity * 5)
									break
							}
							break
					}
					break
			}
			break
		case 'pounds':
			switch (childUom.name.toLowerCase()) {
				case 'pounds':
					convertedQuantity = childQuantity
					break
				case 'ounces':
					convertedQuantity = ouncesToPounds(childQuantity)
					break
				case 'grams':
					convertedQuantity = gramsToPounds(childQuantity)
					break
				case 'kilograms':
					convertedQuantity = kilogramsToPounds(childQuantity)
					break
				case 'each':
					switch (selectedItem.itemType.productForm.toLowerCase()) {
						case 'preroll':
							switch (selectedItem.itemType.productModifier.toLowerCase()) {
								case 'single':
									convertedQuantity = gramsToPounds(childQuantity * 0.5)
									break
								case 'twopack':
									convertedQuantity = gramsToPounds(childQuantity)
									break
								case '10-pack':
									convertedQuantity = gramsToPounds(childQuantity * 5)
									break
							}
							break
					}
					break
			}
			break
		case 'kilograms':
			switch (childUom.name.toLowerCase()) {
				case 'kilograms':
					convertedQuantity = childQuantity
					break
				case 'ounces':
					convertedQuantity = ouncesToKilograms(childQuantity)
					break
				case 'grams':
					convertedQuantity = gramsToKilograms(childQuantity)
					break
				case 'pounds':
					convertedQuantity = poundsToKilograms(childQuantity)
					break
				case 'each':
					switch (selectedItem.itemType.productForm.toLowerCase()) {
						case 'preroll':
							switch (selectedItem.itemType.productModifier.toLowerCase()) {
								case 'single':
									convertedQuantity = gramsToKilograms(childQuantity * 0.5)
									break
								case 'twopack':
									convertedQuantity = gramsToKilograms(childQuantity)
									break
								case '10-pack':
									convertedQuantity = gramsToKilograms(childQuantity * 5)
									break
							}
							break
					}
					break
			}
			break
		// this case for each can get complicated based on item type interactions
		case 'each':
			switch (childUom.name.toLowerCase()) {
				case 'each':
					switch (parentPackage.item.itemType.productForm.toLowerCase()) {
						case 'preroll':
							switch (selectedItem.itemType.productForm.toLowerCase()) {
								case 'preroll':
									// parent and child are both prerolls
									switch (
										parentPackage.item.itemType.productModifier.toLowerCase()
									) {
										case 'single':
											switch (
												selectedItem.itemType.productModifier.toLowerCase()
											) {
												case 'single':
													convertedQuantity = childQuantity
													break
												case 'twopack':
													convertedQuantity = twoPackToSingle(childQuantity)
													break
												case '10-pack':
													convertedQuantity = tenPackToSingle(childQuantity)
													break
											}
											break
										case 'twopack':
											switch (
												selectedItem.itemType.productModifier.toLowerCase()
											) {
												case 'twopack':
													convertedQuantity = childQuantity
													break
												case 'single':
													convertedQuantity = singleToTwoPack(childQuantity)
													break
												case '10-pack':
													convertedQuantity = tenPackToTwoPack(childQuantity)
													break
											}
											break
										case '10-pack':
											switch (
												selectedItem.itemType.productModifier.toLowerCase()
											) {
												case '10-pack':
													convertedQuantity = childQuantity
													break
												case 'single':
													convertedQuantity = singleToTenPack(childQuantity)
													break
												case 'twopack':
													convertedQuantity = twoPackToTenPack(childQuantity)
													break
											}
											break
									}
									break
							}
							break
					}
					break
			}
			break
	}
	return convertedQuantity
}
