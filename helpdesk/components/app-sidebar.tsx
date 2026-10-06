
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter  } from "next/navigation";
import { clearToken, getToken, decodeToken, getRole } from "@/lib/auth";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
   LogOut,
   User,
   Icon,
   
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@base-ui/react";
import { useEffect, useState } from "react";

const EmployeeItems = [
 
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
   {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "My Tickets",
    url: "/tickets",
    icon: Ticket,
  },
  {
    title: "Create Ticket",
    url: "/tickets/create",
    icon: PlusCircle,
    space: true,
  }
  
 
];
const adminItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
 {
    title: "Manage Users",
    url: "/admin/users",
    icon: User,
  },
 {
    title: "Users Tickets",
    url: "/tickets",
    icon: Ticket,
  },
 
 
];
const TechnicianItems = [
 {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
   {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: Ticket,
  },

 
];

export function AppSidebar() {
  const pathname = usePathname();
    const router = useRouter();
  const [decoded, setDecoded] = useState<any>(null);
  const [mounted, setMounted] = useState(false);


useEffect(() => {
  setMounted(true);

  const token = getToken();

  if (token) {
    const decodedToken = decodeToken(token);
    setDecoded(decodedToken);
  }
}, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold h-12">
            IT Help Desk
          </SidebarGroupLabel>

          <SidebarGroupContent >
            <SidebarMenu className="space-y-5">
             
              {mounted && decoded && ["Employee"].includes(getRole(decoded) ?? "") && (
                  <>
                    
                  <SidebarMenuItem key={EmployeeItems[0].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === EmployeeItems[0].url}
                    >
                      <User />
                      <Link  href={EmployeeItems[0].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{EmployeeItems[0].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={EmployeeItems[1].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === EmployeeItems[1].url}
                    >
                      <Ticket />
                      <Link  href={EmployeeItems[1].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{EmployeeItems[1].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={EmployeeItems[2].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === EmployeeItems[2].url}
                    >
                      <Ticket />
                      <Link  href={EmployeeItems[2].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{EmployeeItems[2].title}</span>
                      </Link>
                    </SidebarMenuButton>
                    

                  </SidebarMenuItem>
                  <SidebarMenuItem key={EmployeeItems[3].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === EmployeeItems[3].url}
                    >
                      <Ticket />
                      <Link  href={EmployeeItems[3].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{EmployeeItems[3].title}</span>
                      </Link>
                    </SidebarMenuButton>
                    

                  </SidebarMenuItem>
                  </>
                  )}
              {mounted && decoded && ["Admin"].includes(getRole(decoded) ?? "") && (
                  <>
                    
                  <SidebarMenuItem key={adminItems[0].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === adminItems[0].url}
                    >
                      <User />
                      <Link  href={adminItems[0].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{adminItems[0].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={adminItems[1].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === adminItems[1].url}
                    >
                      <Ticket />
                      <Link  href={adminItems[1].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{adminItems[1].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={adminItems[2].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === adminItems[2].url}
                    >
                      <Ticket />
                      <Link  href={adminItems[2].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{adminItems[2].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  </>
                  



                )}{mounted && decoded && ["Technician"].includes(getRole(decoded) ?? "") && (
                  <>
                    
                  <SidebarMenuItem key={TechnicianItems[0].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === TechnicianItems[0].url}
                    >
                      <User />
                      <Link  href={TechnicianItems[0].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{TechnicianItems[0].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={TechnicianItems[1].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === TechnicianItems[1].url}
                    >
                      <Ticket />
                      <Link  href={TechnicianItems[1].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{TechnicianItems[1].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  <SidebarMenuItem key={TechnicianItems[2].title}>
                    <SidebarMenuButton
                      
                      isActive={ pathname === TechnicianItems[2].url}
                    >
                      <Ticket />
                      <Link  href={TechnicianItems[2].url} className="flex items-center gap-2 text-sm font-medium">
                        
                        <span>{TechnicianItems[2].title}</span>
                      </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                  </>
                  
                )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
       <SidebarMenu className="space-y-4">
        <SidebarMenuItem className="text-lg font-semibold">
          <SidebarMenuButton
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
          </SidebarMenuItem>
       </SidebarMenu>
      </SidebarFooter>  
    </Sidebar>
  );
}
