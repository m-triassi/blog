---
title: Using Obsidian for Work
excerpt: How I make use of Obsidian to collect my thoughts, and knowledge at work.
publishDate: 2024-11-18
tags:
  - productivity
isFeatured: true
seo:
  image:
    src: /post2-vault.jpg
    alt: An open bank vault door in the library of congress, black and white photograpy
---

![Cover image](/post2-vault.jpg)

[Obsidian](https://obsidian.md/) is a full featured, free (as in beer) markdown editor. It features a rich plugin system, an active community, and lots of configurability. In fact, it's what i'm authoring this very blog post in, right now. A little over a year ago i started using it daily to organize and store information about my life, write documentation about devices and equipment I own, and to journal and track data about myself. At some point along the way i realized that would also be really useful for keeping myself organized at work.

So I took the time to make a variation of my personal vault, but orient it more towards my job functions. I ended up presenting it to my team during an all hands and threw it into [a GitHub repository](https://github.com/m-triassi/obsidian-workvault-template) for anyone to use, in case their brain worked the same as mine.

**Nb**: Don't just trust me because I wrote a blog post, be sure to **audit the repository before you use the vault** as the plugins can execute arbitrary Javascript.

## Goals
When I put this vault together I wanted something that could serve as a hub of knowledge for everything I've done and need to do while working. To that end i wanted a place to track tasks I needed to complete, things I've learnt throughout the day that may be very domain specific, and even my relationships with my co-workers. I wanted to be able to defer to my vault to answer any questions I may receive, so that my mind can be free to focus on the future.

I also wanted a "dashboard" of sorts so that the most important things that need my attention can be front of mind. Oh, and it should look pretty :)

## Structure
I decided to take a [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten)-ish approach to note taking. That means that everything starts with the daily note. From there things can bubble up into synthesized knowledge or documentation. Otherwise if its not important it can fade into the distance, and eventually become irrelevant (but still accessible, for those digital hoarders out there, *ahem...* like me).

### Daily Notes
This represents the most discreet form of information gathering. At the start of the work day, I can make a new daily note with the command pallet (`ctrl+p` > "Open Today's Daily Note"), and start documenting my day as it happens.

There are a couple sections of the daily note; "Tasks", and "Ephemeral Notes". Most of these are self explanatory, but I'll call out some of the ways I use them for completeness. Starting with "Tasks": If I get an ad hoc request from someone I can just jot it down under this section, pretty straight forward. if it's time sensitive, then I'll add a data property, `Due` to that line.

```markdown
- [ ] Do the thing [Due:: 2024-11-18]
```

Doing this has some cool interactions with the `_Front Page` file via the [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview). Mainly that (a) Incomplete tasks will pile up there, and (b) if the task is past due, it shows up in a separate list.

The rest of the file is for errant thoughts, notes, and lessons learned throughout the day. If anything is significant enough that it warrants returning to it, then I mark the `should-process` property to `true` in the file's front-matter. That way, at the end of the week, or next chance I get I can synthesize that knowledge or note into its own file, and elaborate on it. This also has a nice interaction with the front page, in that, files that `should-process` but aren't `processed` will pile up to remind me.

All of this was built with the "I have lots to do and little time to write it all down" situation I sometime find myself in. It's all about reducing that unpleasant feeling that i'm forgetting something. Even the note toolbars are mean't to make it quick to jot stuff down with accurate timestamps (or of course, via slash commands like `/time`).

## Knowledge & Documentation

These two sections are pretty similar and much more free form. Here I write down domain specific knowledge and skills I've learned on the job. A lot of it is my understanding language constructs and development practices, like implementing specific architecture patterns in PHP or Javascript. A lot of the time a piece of knowledge from a daily note will get expanded upon into it's own file in this directory.

In the Documentation folder, I'll typically put together knowledge about existing, in-house and non-standard systems we maintain. A good example might be how we deploy a specific project to production, or the standard developer environment setup steps for when I'm on-boarding a new teammate. Obviously, this stuff is not useful if only I can read it, so usually Documentation pages start their life in this folder, but eventually make it into the appropriate README or wiki pages so that the rest of my team can read and gain value from it.

## Projects
Any time I have to take on a new project, I use this folder to start collecting my ideas about how it might all shake out. Part of that process at Plank is to have "hack days" with new clients where we discuss the parameters and needs of the project we're taking on. During these meetings i'll usually capture any requirements specifications in this folder and start to make domain diagrams. When we get to the point of creating user story cards in our project management software, I've usually amassed a treasure trove of good information to use to in creating acceptance criteria.

Other times, I also use this folder to document smaller internal project, like when we build an in-house tool or when we publish an open source package. That's when I break out the "Project one-sheet" template, while client projects usually get their own sub-directory with various files depending on their needs.

## Interpersonal
This is probably my most controversial folder, here I document relationships with my co-workers. I've told people in my personal life about this, and lots of them seem to think it's a bit much. I think this mostly stems from the "unknown" aspect of what might be inside it, as i'm pretty adverse to sharing the contents of these files with people. The thing to realize though is that these files are pretty mundane, they really just act as a place to record things I've spoken to that person about, and ways I may be able to help them.

The included "Interpersonal File" template gives a pretty good idea of what that file might look like. The majority of this file gets taken up by one-on-one notes, and any achievements and wins. Stuff like that make it really easy for me to make a case for a teammate to get a promotion or raise when that time of year rolls around since I have a neat list I can reference.

I even keep an interpersonal file for myself, with most of the same headings and subject matter.

## Conclusion
Overall this system works really well for me; maybe it works well for you too. The only way to know is to try it out! [Check out the repository](https://github.com/m-triassi/obsidian-workvault-template) and consider giving it a star if you like it. I'm also open to feedback on it or pull requests adding new structure to the vault. I recognize there's nothing ground breaking here, but I also know that staring at a blank Obsidian vault is kind of intimidating, so I hope this, at the very least give you some solid ideas you can walk away with.

## Resources

- [AnuPpuccin theme](https://github.com/AnubisNekhet/AnuPpuccin): How i made the vault pretty.
