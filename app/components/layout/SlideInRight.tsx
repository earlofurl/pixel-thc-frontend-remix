import {Dialog, Transition} from "@headlessui/react";
import {useCatch, useNavigate} from "@remix-run/react";
import React, {Fragment} from "react";

function classNames(...classes: (string | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function SlideInRight(props): JSX.Element {
    const open = true;
    const navigate = useNavigate();

    function onDismiss() {
        navigate("../");
    }

    return (
        <Transition.Root
            show={open}
            as={Fragment}
        >
            <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-hidden"
                onClose={onDismiss}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <Dialog.Overlay className="absolute inset-0"/>

                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-in-out duration-300 sm:duration-700"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in-out duration-300 sm:duration-700"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <div className="pointer-events-auto w-screen max-w-md">
                                <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                                    <div className="h-0 flex-1 overflow-y-auto">
                                        {/* SlideIn Content */}
                                        {props.children}
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

export function ErrorBoundary({error}: { error: Error }): JSX.Element {
    console.error(error);

    return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
    const caught = useCatch();

    if (caught.status === 404) {
        return <div>Not found</div>;
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
