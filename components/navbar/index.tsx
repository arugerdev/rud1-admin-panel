"use client"

import * as React from "react"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


import Icon from '@/public/icon.png'
import Image from "next/image"
export function Navbar({ setPage }: Readonly<{ setPage: React.Dispatch<React.SetStateAction<string>> }>) {

    setPage = React.useCallback(setPage, [setPage])

    return (
        <NavigationMenu className="flex flex-col min-w-screen max-w-screen w-screen items-start gap-0 p-4 border-b border-[#333]">
            <NavigationMenuList className="flex flex-row gap-2 items-center">
                <button className="p-0 m-0" onClick={() => setPage('general')}>
                    <Image src={Icon} alt="" width={32} />
                </button>

                <NavigationMenuItem className="p-0 m-0">
                    <button className="p-0 m-0" onClick={() => setPage('config')}>
                        <NavigationMenuLink className={`md:text-normal p-0 m-0 text-[12px] ${navigationMenuTriggerStyle()}`}>
                            Configuración
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem className="p-0 m-0">
                    <button className="p-0 m-0" onClick={() => setPage('services')}>
                        <NavigationMenuLink className={`md:text-normal p-0 m-0 text-[12px] ${navigationMenuTriggerStyle()}`}>
                            Servicios
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem className="p-0 m-0">
                    <button className="p-0 m-0" onClick={() => setPage('details')}>
                        <NavigationMenuLink className={` md:text-normal text-[12px] ${navigationMenuTriggerStyle()}`}>
                            Detalles
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem className="p-0 m-0">
                    <button className="p-0 m-0" onClick={() => setPage('actions')}>
                        <NavigationMenuLink className={`md:text-normal p-0 m-0 text-[12px] ${navigationMenuTriggerStyle()}`}>
                            Acciones
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
