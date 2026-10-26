export default function Home() {
  return (
    <main>
      <h1>What is this?</h1>
      <p>
        This repo is a template that you can give to an AI agent so that you
        can quickly deploy static websites using a NextJS and Cloudflare Worker
        stack.
      </p>
      <p>
        Your agent should be able to clone this repo, or use it to instantiate
        a new Github project for you, then guide you on how to get it deployed
        using Cloudflare.
      </p>

      <h2>Rationale</h2>
      <p>
        This project is a spin-off from an internal project I built at the last
        company I was working at. We needed a super simple and cheap way for
        non-engineering staff to be able to experiment and deploy vibe-coded
        applications safely, and with minimal overhead to the engineering team.
      </p>
      <p>As a devops engineer, all I need to do is:</p>
      <ol>
        <li>Give this template to the vibe-coder</li>
        <li>
          Create a Cloudflare application for this repo and hook it up to a
          domain/Cloudflare Access
        </li>
      </ol>

      <h2>Limitations</h2>
      <p>
        This repo is meant to be an exceptionally lean implementation of this
        type of workflow, so the only sites you can deploy here must be static.
        For example, with the NextJS directive <code>output: &quot;export&quot;</code>.
      </p>

      <h2>How to use</h2>
      <blockquote>
        You can send this repo to your agent. If necessary, just point it to
        the AGENTS.md file.
      </blockquote>
      <ol>
        <li>
          Set up the connection between Github and Cloudflare. This can be done
          by going to the Cloudflare Web console &gt; Workers &gt; Create
          application &gt; Github. Then follow the prompts.
        </li>
        <li>Create a new Github repo by using this as a template.</li>
        <li>
          Go to the Cloudflare Web console &gt; Workers &gt; Create application
          &gt; Github, and then pick your new repo.
        </li>
        <li>
          Follow the prompts, then enable the workers domain and your
          application will be live at <code>.workers.dev</code>!
        </li>
      </ol>
      <footer>
        <a href="https://github.com/delta1513/agentic-cloudflare-static-site-template">
          View this template on GitHub
        </a>
      </footer>
    </main>
  );
}
