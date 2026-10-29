import sourceEnglish from './writings.en.json';
// English editorial summaries of the existing Chinese originals; artwork stays in its original language.
export const prototypeText=(lang,zh,en)=>lang==='zh'?zh:en;
const reviewedEnglish={
  '2049593726360721196':['Blind spots in Agent search','Why grep-based search struggles with large histories, semantic paraphrases and queries spanning conversations.'],
  'goal':['What does Goal mode add to an Agent?','Two pieces on sustained work, automatic continuation and deciding when a task is complete.'],
  'context-sep':['How is Agent context architecture changing?','Following discussions and engineering practice around Agent context architecture.'],
  '2060715503174341318':['When building gets cheaper, what becomes central to knowledge work?','Following the direction of Codex and ChatGPT: choosing, making tradeoffs and coordinating become more central to the work.'],
  '2072291792742098269':['How does Perplexity design Agent Skills?','Following a team’s practice in Skill quality, context efficiency and handling exceptions.'],
  '2026240034802528822':['Why does the same model behave differently across Agent platforms?','A comparison of Hermes and OpenClaw: tools, system prompts and context management change actual behavior.'],
  '2060032007506334292':['Agent Memory Systems: four control planes for long-term memory','Writing, organizing, retrieving and rewriting or clearing memory explain why the same storage can produce very different systems.'],
  '2031687123431051328':['Claude Code Compact: from compression to recoverable memory','How Claude Code compresses context near the window limit, then rebuilds working memory when a session resumes.'],
  '2062215260971521921':['What does Anthropic’s J-space actually demonstrate?','Directly continuing a language and identifying its category may use different internal paths. A closer reading of the evidence.'],
  '2062205073929852736':['What is Anthropic’s J-space?','Recognizing Spanish can lead to continuing in Spanish or naming the language. These tasks may take different internal paths.'],
  '2067243428048532935':['Context engineering in practice: lessons from Manus','Why context learning and engineering around the model matter when building reliable Agents.'],
  '2064505443020493922':['A readable introduction to reinforcement learning','From ChatGPT and AlphaGo to DeepSeek-R1: how reward and trial and error complement large training datasets.'],
  '2058836696989430641':['The filesystem as a database for a personal AI operating system','A translated reading on preserving memory, voice and judgment across conversations.'],
  '2056779362637197627':['Inside Hermes Agent','Following the source from prompt assembly and context compression to a gateway spanning multiple platforms.'],
  '2046699626565219617':['What does ChatGPT’s Dreaming memory do?','The engineering challenges of storing, retrieving and forgetting AI memories.'],
  '2044166992513520802':['Beyond the Prompt: a guide to Claude Code','Verification, planning and configuration for daily development and team workflows.'],
  '2036754568097296982':['Claude Code: Session, Context and Memory','A source-based study of the three layers that manage an AI coding assistant’s working state.'],
  '2023716322018619767':['Claude Code’s architecture, from 520,000 lines of source','From the CLI and Agent loop to tool calls and context management, reconstructing the design of an AI coding assistant.']
};
export const localizedNote=(note,lang)=>{
  if(lang==='zh')return note;
  const translation=reviewedEnglish[note.id] || (sourceEnglish[note.id] && [sourceEnglish[note.id].title,sourceEnglish[note.id].teaser]);
  const labels={goal:'Codex Goal','context-sep':'Context architecture','2072291792742098269':'Agent Skills','2060715503174341318':'Knowledge work','2026240034802528822':'Platform differences'};
  return {...note,originalTitle:note.title,title:translation?.[0]||note.title,teaser:translation?.[1]||note.teaser,label:labels[note.id]||note.label,source:note.source==='知乎'?'Zhihu':note.source==='微信合集'?'WeChat collection':note.source};
};
export const tasteEnglish={
  'thousand-brains.png':['Three threads in A Thousand Brains','Cortical columns, reference frames, voting: a reading poster that compresses the book into three parallel threads.'],
  'a2a-cover.png':['Collaboration stops at internal boundaries','Two paper terrains meet only at the handoff. A cover for A2A cooperation: tasks and results are exchanged, internals stay invisible.'],
  'research-stages.png':['Three stages of a research project','A timeline links three stages in sequence, not in duration. Explanatory diagrams organize information by relation.'],
  'kami.png':['A reading workbench','An actual Obsidian workspace: warm paper and serif text keep long reading sessions focused on the content.'],
  'kami-reading.webp':['Long-form reading','The same theme in a long-form view, showing the hierarchy of text, diagrams and the sidebar.']
};
