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
            <NavigationMenuList>
                <button onClick={() => setPage('general')}>
                    <Image src={Icon} alt="" width={32} />
                </button>

                <NavigationMenuItem>
                    <button onClick={() => setPage('config')}>
                        <NavigationMenuLink className={`md:text-normal text-sm ${navigationMenuTriggerStyle()}`}>
                            Configuración
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button disabled className="text-[#AAA]" onClick={() => setPage('services')}>
                        <NavigationMenuLink className={`md:text-normal text-sm ${navigationMenuTriggerStyle()}`}>
                            Servicios
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button disabled className="text-[#AAA]" onClick={() => setPage('details')}>
                        <NavigationMenuLink className={` md:text-normal text-sm ${navigationMenuTriggerStyle()}`}>
                            Detalles
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button disabled className="text-[#AAA]" onClick={() => setPage('actions')}>
                        <NavigationMenuLink className={`md:text-normal text-sm ${navigationMenuTriggerStyle()}`}>
                            Acciones
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button disabled className="text-[#AAA]" onClick={() => setPage('help')}>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Ayuda
                        </NavigationMenuLink>
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
