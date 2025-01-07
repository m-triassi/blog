export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Index Zero',
    subtitle: 'Musings on development by Massimo Triassi',
    description: 'A technology blog by Massimo Triassi',
    image: {
        src: '/hero.jpg',
        alt: 'A person sitting on a couch smiling at his coworkers'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Tags',
            href: '/tags'
        },
        {
            text: 'Resume',
            href: 'https://www.triassi.ca?utm_source=blog'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        },
        {
            text: 'Terms',
            href: '/terms'
        }
    ],
    socialLinks: [
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/massimo-triassi-b430b5157/'
        },
        {
            text: 'Bluesky',
            href: 'https://bsky.app/profile/triassi.dev'
        }
    ],
    hero: {
        title: 'Welcome to my personal blog!',
        text: "I'm **Massimo Triassi**, a Senior Back-end developer and Team lead at <a href='https://plank.co'>Plank</a>. " +
            "I'm passionate about building great user experiences and I love to share my knowledge with others. " +
            "I'm also a big fan of open source and I'm always looking for new projects to contribute to. " +
            "If you're interested in working with me, feel free to get in touch. " +
            "You can find more about me on my <a href='https://www.linkedin.com/in/massimo-triassi-b430b5157/'>LinkedIn</a> profile or " +
            "you can see some of my work on my <a href='https://github.com/massimo-triassi'>GitHub</a> profile.",
        image: {
            src: '/hero.jpg',
            alt: 'A person sitting on a couch smiling at his coworkers'
        },
        actions: [
            {
                text: 'Get in Touch',
                href: '/contact'
            }
        ]
    },
    subscribe: {
        title: 'Subscribe to the Index Zero Newsletter',
        text: 'One update per week. All the latest posts directly in your inbox.',
        formUrl: '#'
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
