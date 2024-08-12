/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MarkdownToDocumentConvertor } from './convertor';

export const markdownData = `# Example

## What is an Agentic Workflow?

An **agentic workflow** is a system that uses AI agents to autonomously pursue complex goals and workflows with limited [direct human supervision](https://promptengineering.org/exploring-agentic-wagentic-workflows-the-power-of-ai-agent-collaborationorkflows-the-power-of-ai-agent-collaboration/)

[These AI agents exhibit autonomous decision-making, planning, and adaptive execution to complete multi-step processes](https://www.moveworks.com/us/en/resources/blog/agentic-ai-the-next-evolution-of-enterprise-ai).

The key features of agentic workflows include:

- **Autonomy**: [The ability to take goal-directed actions with minimal human oversight](https://www.moveworks.com/us/en/resources/blog/agentic-ai-the-next-evolution-of-enterprise-ai)
- **Reasoning**: [Contextual decision-making to make judgment calls and weigh tradeoffs](https://www.moveworks.com/us/en/resources/blog/agentic-ai-the-next-evolution-of-enterprise-ai)

## Three Major Pillars of Agentic Workflows

1. **AI Agents**: [Sophisticated instances of large language models (LLMs) that are uniquely configured to embody specific personalities, roles, or functions](https://promptengineering.org/exploring-agentic-wagentic-workflows-the-power-of-ai-agent-collaborationorkflows-the-power-of-ai-agent-collaboration/). They can transcend traditional AI capabilities by engaging with a variety of tools and resources.
2. **Prompt Engineering Techniques & Frameworks**: [Advanced techniques such as Planning, Chain of Thought, and Self-Reflection enable AI agents to generate drafts, engage in iterative self-improvement, and adapt their plans when faced with challenges](https://promptengineering.org/exploring-agentic-wagentic-workflows-the-power-of-ai-agent-collaborationorkflows-the-power-of-ai-agent-collaboration/).
3. **Generative AI Networks**: [Agentic workflows leverage generative AI networks to perform a wide range of actions, from conducting web searches and executing code to manipulating images, significantly extending the utility and application range of LLMs](https://promptengineering.org/exploring-agentic-wagentic-workflows-the-power-of-ai-agent-collaborationorkflows-the-power-of-ai-agent-collaboration/).`;

export function demo() {
    const convertor = new MarkdownToDocumentConvertor(markdownData);

    const umd = convertor.convert();

    console.log(umd);

    return umd;
}
