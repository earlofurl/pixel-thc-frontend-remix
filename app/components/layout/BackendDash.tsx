import { Fragment, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
	Bars3BottomLeftIcon,
	HomeIcon,
	PlusIcon,
	RectangleStackIcon,
	Squares2X2Icon,
	XMarkIcon,
	FolderIcon,
	BeakerIcon,
	MapPinIcon,
} from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Link, NavLink, Outlet } from '@remix-run/react'

const sidebarNavigation = [
	{ name: 'Dashboard', to: '/org/dashboard', icon: HomeIcon },
	{
		name: 'Inventory',
		to: '/org/inventory',
		icon: Squares2X2Icon,
	},
	{
		name: 'Orders',
		to: '/org/orders',
		icon: RectangleStackIcon,
	},
	{
		name: 'Sales Sheets',
		to: '/org/sales-sheets',
		icon: FolderIcon,
	},
	{
		name: 'Locations',
		to: '/org/locations',
		icon: MapPinIcon,
	},
	{
		name: 'Labs',
		to: '/org/lab-tests',
		icon: BeakerIcon,
	},
]

const userNavigation = [
	{ name: 'Your Profile', href: '#' },
	{ name: 'Sign out', href: '#' },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

const selectedNavLinkClass =
	'bg-slate-700 text-white group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium'
const unselectedNavLinkClass =
	'group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium text-indigo-100 hover:bg-indigo-700/50 hover:text-white'

export default function BackendDash(): JSX.Element {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<div className="flex h-full min-h-screen">
			{/* Narrow sidebar */}
			<div className="hidden w-28 overflow-y-auto bg-slate-800 md:block">
				<div className="flex w-full flex-col items-center py-6">
					<div className="flex flex-shrink-0 items-center">
						<img
							className="h-8 w-auto"
							src="https://tailwindui.com/img/logos/mark.svg?color=white"
							alt="Your Company"
						/>
					</div>
					<div className="mt-6 w-full flex-1 space-y-1 px-2">
						{sidebarNavigation.map((item) => (
							<NavLink
								key={item.name}
								to={item.to}
								className={({ isActive }) =>
									isActive ? selectedNavLinkClass : unselectedNavLinkClass
								}
								aria-current={({ isActive }) => {
									return isActive ? 'page' : undefined
								}}>
								{({ isActive }) =>
									isActive ? (
										<>
											<item.icon
												className={'h-6 w-6 text-white'}
												aria-hidden="true"
											/>{' '}
											<span className="mt-2">{item.name}</span>
										</>
									) : (
										<>
											<item.icon className="h-6 w-6 text-indigo-300 group-hover:text-white" />{' '}
											<span className="mt-2">{item.name}</span>
										</>
									)
								}
							</NavLink>
						))}
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<Transition.Root show={mobileMenuOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-20 md:hidden"
					onClose={setMobileMenuOpen}>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
					</Transition.Child>

					<div className="fixed inset-0 z-40 flex">
						<Transition.Child
							as={Fragment}
							enter="transition ease-in-out duration-300 transform"
							enterFrom="-translate-x-full"
							enterTo="translate-x-0"
							leave="transition ease-in-out duration-300 transform"
							leaveFrom="translate-x-0"
							leaveTo="-translate-x-full">
							<Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-800 pt-5 pb-4">
								<Transition.Child
									as={Fragment}
									enter="ease-in-out duration-300"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="ease-in-out duration-300"
									leaveFrom="opacity-100"
									leaveTo="opacity-0">
									<div className="absolute top-1 right-0 -mr-14 p-1">
										<button
											type="button"
											className="flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
											onClick={() => setMobileMenuOpen(false)}>
											<XMarkIcon
												className="h-6 w-6 text-white"
												aria-hidden="true"
											/>
											<span className="sr-only">Close sidebar</span>
										</button>
									</div>
								</Transition.Child>
								<div className="flex flex-shrink-0 items-center px-4">
									<img
										className="h-8 w-auto"
										src="https://tailwindui.com/img/logos/mark.svg?color=white"
										alt="Your Company"
									/>
								</div>
								<div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
									<nav className="flex h-full min-h-screen flex-col">
										<div className="space-y-1">
											{/* Mobile sidebar nav menu items */}
											{/* TODO: Button element is nested wrong so user has to click directly on text instead of div*/}
											{sidebarNavigation.map((item) => (
												<NavLink
													key={item.name}
													to={item.to}
													className={({ isActive }) =>
														isActive
															? 'group flex items-center rounded-md bg-slate-700 py-2 px-3 text-sm font-medium text-white'
															: 'group flex items-center rounded-md py-2 px-3 text-sm font-medium text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
													}
													aria-current={({ isActive }) => {
														return isActive ? 'page' : undefined
													}}>
													{({ isActive }) =>
														isActive ? (
															<>
																<item.icon
																	className={'mr-3 h-6 w-6 text-white'}
																	aria-hidden="true"
																/>{' '}
																<button
																	type="button"
																	onClick={() => {
																		setMobileMenuOpen(false)
																	}}
																	className="mt-2">
																	{item.name}
																</button>
															</>
														) : (
															<>
																<item.icon className="mr-3 h-6 w-6 text-indigo-300 group-hover:text-white" />{' '}
																<button
																	type="button"
																	onClick={() => {
																		setMobileMenuOpen(!mobileMenuOpen)
																	}}
																	className="mt-2">
																	{item.name}
																</button>
															</>
														)
													}
												</NavLink>
											))}
										</div>
									</nav>
								</div>
							</Dialog.Panel>
						</Transition.Child>
						<div className="w-14 flex-shrink-0" aria-hidden="true">
							{/* Dummy element to force sidebar to shrink to fit close icon */}
						</div>
					</div>
				</Dialog>
			</Transition.Root>

			{/* Content area */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="w-full">
					<div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
						<button
							type="button"
							className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
							onClick={() => setMobileMenuOpen(true)}>
							<span className="sr-only">Open sidebar</span>
							<Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
						</button>
						<div className="flex flex-1 justify-between px-4 sm:px-6">
							<div className="flex flex-1">
								<form className="flex w-full md:ml-0" action="#" method="GET">
									<label htmlFor="search-field" className="sr-only">
										Search all files
									</label>
									<div className="relative w-full text-gray-400 focus-within:text-gray-600">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
											<MagnifyingGlassIcon
												className="h-5 w-5 flex-shrink-0"
												aria-hidden="true"
											/>
										</div>
										<input
											name="search-field"
											id="search-field"
											className="h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0"
											placeholder="Search"
											type="search"
										/>
									</div>
								</form>
							</div>
							<div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6">
								{/* Profile dropdown */}
								<Menu as="div" className="relative flex-shrink-0">
									<div>
										<Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
											<span className="sr-only">Open user menu</span>
											<img
												className="h-8 w-8 rounded-full"
												src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
												alt=""
											/>
										</Menu.Button>
									</div>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95">
										<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											{userNavigation.map((item) => (
												<Menu.Item key={item.name}>
													{({ active }) => (
														<Link
															to={item.href}
															className={classNames(
																active ? 'bg-gray-100' : '',
																'block px-4 py-2 text-sm text-gray-700',
															)}>
															{item.name}
														</Link>
													)}
												</Menu.Item>
											))}
										</Menu.Items>
									</Transition>
								</Menu>

								<button
									type="button"
									className="flex items-center justify-center rounded-full bg-indigo-600 p-1 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
									<PlusIcon className="h-6 w-6" aria-hidden="true" />
									<span className="sr-only">Add file</span>
								</button>
							</div>
						</div>
					</div>
				</header>

				{/* Main content */}
				<div className="flex flex-1 items-stretch overflow-hidden">
					<main className="flex-1 overflow-y-auto">
						{/* Primary column */}
						<section
							aria-labelledby="primary-heading"
							className="flex h-full min-h-screen min-w-0 flex-1 flex-col lg:order-last">
							<h1 id="primary-heading" className="sr-only">
								Primary
							</h1>
							<Outlet />
						</section>
					</main>
				</div>
			</div>
		</div>
	)
}

// className={classNames(
// 		item.current
// 		? 'bg-indigo-800 text-white'
// 		: 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
// 	'group flex items-center rounded-md py-2 px-3 text-sm font-medium',
// )}
// aria-current={item.current ? 'page' : undefined}>
// 	<item.icon
// className={classNames(
// 		item.current
// 		? 'text-white'
// 		: 'text-indigo-300 group-hover:text-white',
// 	'mr-3 h-6 w-6',
// )}
// aria-hidden="true"
