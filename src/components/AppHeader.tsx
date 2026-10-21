'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBooks, IconListDetails, IconPlayerPlay } from '@tabler/icons-react';
import { sv } from '@/i18n/sv';
import classes from './AppHeader.module.css';

const links = [
  { href: '/edit', label: sv.nav.lists, icon: IconListDetails },
  { href: '/train', label: sv.nav.practice, icon: IconPlayerPlay },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Link href="/edit" className={classes.brand}>
          <IconBooks size={26} aria-hidden="true" />
          <span>{sv.brand}</span>
        </Link>
        <nav aria-label={sv.nav.label} className={classes.nav}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={classes.link}
                aria-current={active ? 'page' : undefined}
                data-active={active || undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
