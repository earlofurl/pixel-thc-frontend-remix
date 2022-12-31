import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import type { ActivePackageWithLabs } from '~/models/types/custom';
import { Link, useNavigate } from '@remix-run/react';
import { Row } from '@tanstack/react-table';
import {
	ArrowRightCircleIcon,
	ArrowRightOnRectangleIcon,
	EllipsisVerticalIcon,
	PencilSquareIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
} from '@heroicons/react/20/solid';

function classNames(
	...classes: readonly (string | undefined)[]
): string | undefined {
	return classes.filter(Boolean).join(' ');
}

export default function PackageTableRowActions({
	row,
}: {
	row: Row<ActivePackageWithLabs>;
}): JSX.Element {
	const navigate = useNavigate();

	function handleCreateFromButtonClick() {
		return navigate('create-package', {
			state: { selectedParentPackageId: row.original.id },
		});
	}

	return (
		<Menu as="div" className="relative items-center">
			<div>
				<Menu.Button className="items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
					<span className="sr-only">Open options</span>
					<EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
				{/* TODO: Decide on button vs a or Link and keep consistent */}
				<Menu.Items className="fixed absolute isolate z-20 mt-2 w-56 origin-top-left divide-y divide-gray-100 overflow-visible rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<button
									type="button"
									onClick={handleCreateFromButtonClick}
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<PlusIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Create From
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<a
									href="#"
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<PencilSquareIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Edit
								</a>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<Link
									to="add-pckg-to-order"
									state={{ selectedPackage: row.original }}
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<ArrowRightOnRectangleIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Add to Order
								</Link>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<Link
									to="assign-tag"
									state={{ selectedParentPackageId: row.original.id }}
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<TagIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Assign Tag
								</Link>
							)}
						</Menu.Item>
					</div>
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<a
									href="#"
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<ArrowRightCircleIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Move
								</a>
							)}
						</Menu.Item>
					</div>
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<a
									href="#"
									className={classNames(
										active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
										'group flex items-center px-4 py-2 text-sm',
									)}>
									<TrashIcon
										className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
									/>
									Delete
								</a>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
