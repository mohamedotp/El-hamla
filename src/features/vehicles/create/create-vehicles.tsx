'use client';
import React from "react"
import { Button } from "@/components/ui/button";
import { Router } from "next/router";
import Link from "next/link";
export  default function CreateVehicles() {
    return(
    <Link href={"/vehicles/add-vehicles"}> <Button className="text-[16px]" style={{textShadow:"0 0 10px #ffffff"}} > اضافة سيارة </Button></Link>

    )
};