---
layout: subpage
title: Writings
permalink: /writings/
---

<h1 class="subpage-title">Writings</h1>
<p class="subpage-lead">Long-form notes on AI engineering, agent systems, and tools for thought.</p>

<div class="writing-list">
  {% for article in site.data.writings.articles %}
  <article class="writing-list-entry">
    <div class="writing-list-date">
      <span>{{ article.date }}</span>
      <span class="writing-card-source">{{ article.source }}</span>
    </div>
    <div class="writing-list-body">
      <a href="{{ article.url }}" target="_blank" rel="noopener">
        <strong>{{ article.title }}</strong>
      </a>
      <p>{{ article.teaser }}</p>
    </div>
  </article>
  {% endfor %}
</div>

<a class="writing-cta" href="{{ site.data.writings.collection_url }}" target="_blank" rel="noopener" style="margin-top: 24px; display: inline-flex;">{{ site.data.writings.collection_label }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
