# [Click me for the demo](https://agentic-cloudflare-static-site-template.deltadelta.workers.dev/)

# What is this?

This repo is a template that you can give to an AI agent so that you can quickly deploy static websites using a NextJS and Cloudflare Worker stack.

Your agent should be able to clone this repo, or use it to instantiate a new Github project for you, then guide you on how to get it deployed using Cloudflare.

# Rationale

This project is a spin-off from an internal project I built at the last company I was working at. We needed a super simple and cheap way for non-engineering staff to be able to experiment and deploy vibe-coded applications safely, and with minimal overhead to the engineering team.

As a devops engineer, all I need to do is:
1. Give this template to the vibe-coder
2. Create a Cloudflare application for this repo and hook it up to a domain/Cloudflare Access

# Limitations

This repo is meant to be an exceptionally lean implementation of this type of workflow, so the only sites you can deploy here must be static. For example, with the NextJS directive `output: "export"`.

# How to use

> You can send this repo to your agent. If necessary, just point it to the AGENTS.md file.

1. Set up the connection between Github and Cloudflare. This can be done by going to the Cloudflare Web console > Workers > Create application > Github. Then follow the prompts.
2. Create a new Github repo by using this as a template.
3. Go to the Cloudflare Web console > Workers > Create application > Github, and then pick your new repo.
4. Follow the prompts, then enable the workers domain and your application will be live at `.workers.dev`!
