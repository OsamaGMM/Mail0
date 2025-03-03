"use client";

import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import Link from "next/link";

interface NavItemProps {
  title: string;
  url: string;
  icon?: React.ComponentType<any>;
  badge?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  suffix?: React.ComponentType<any>;
  subItems?: Array<{
    title: string;
    url: string;
    isActive?: boolean;
  }>;
}

interface NavMainProps {
  items: {
    title: string;
    items: NavItemProps[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  // Create refs for each icon
  const iconRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  // Initialize refs for all items
  useEffect(() => {
    items.forEach((section) => {
      section.items.forEach((item) => {
        if (item.icon && !iconRefs.current[item.title]) {
          iconRefs.current[item.title] = React.createRef();
        }
      });
    });
  }, [items]);

  const isUrlActive = (url: string) => {
    const cleanPath = pathname?.replace(/\/$/, "") || "";
    const cleanUrl = url.replace(/\/$/, "");
    return cleanPath === cleanUrl;
  };

  return (
    <nav className="space-y-6">
      {items.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
              {section.title}
            </h2>
          )}
          <div className="space-y-1">
            {section.items.map((item, j) => (
              <div key={j} className="px-3">
                <Link
                  href={item.url}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center justify-between rounded-md px-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    (item.isActive || isUrlActive(item.url)) &&
                      "bg-accent/90 font-bold text-accent-foreground",
                  )}
                  onMouseEnter={() => {
                    const iconRef = iconRefs.current[item.title]?.current;
                    if (iconRef?.startAnimation) {
                      iconRef.startAnimation();
                    }
                  }}
                  onMouseLeave={() => {
                    const iconRef = iconRefs.current[item.title]?.current;
                    if (iconRef?.stopAnimation) {
                      iconRef.stopAnimation();
                    }
                  }}
                >
                  <div className="flex items-center">
                    {item.icon && (
                      <item.icon ref={iconRefs.current[item.title]} className="mr-3 h-3.5 w-3.5" />
                    )}
                    <span className="text-[13px]">{item.title}</span>
                  </div>
                  <div className="flex items-center">
                    {item.suffix && (
                      <item.suffix
                        className={cn(
                          "ml-2 h-4 w-4 transform transition-transform duration-200 ease-in-out",
                          item.isExpanded && "rotate-180",
                        )}
                      />
                    )}
                  </div>
                </Link>
                {item.isExpanded && item.subItems && (
                  <div className="ml-6 space-y-1 py-1">
                    {item.subItems.map((subItem, k) => (
                      <Link
                        key={k}
                        href={subItem.url}
                        className={cn(
                          "mx-1 flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          subItem.isActive && "bg-accent font-bold text-accent-foreground",
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
