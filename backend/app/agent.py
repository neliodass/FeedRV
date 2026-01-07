from pydantic import BaseModel,Field
from pydantic_ai import Agent
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider
import os
class LinkAnalysis(BaseModel):
    url: str = Field(..., description="The URL of the link to analyze")
    title: str = Field(..., description="The title of the link- try to create better title if original is clickbait or misleading,use original title only if it's good")
    summary: str = Field(..., description="A brief summary of the content at the link")
    creator: str = Field(..., description="The owner or author of the content, if available, otherwise forum site name, other 'unknown'")
    tags: list[str] = Field(..., description="List of 3-5 relevant tags for the link i.e. coding, study, gaming, in lowercase english. Be specific, and tremendous strict, always enter at least 2 tags which will specify if it's research, entertainment, educational,time-waste etc.")
    priority: int = Field(..., ge=1, le=10, description="Priority level from 1 to 10. Prioritize valuable content higher,like some courses or science content,unambitious entertainment lower, spam or clickbait news lowest. Be strict.")
    source_type: str = Field(..., description="Type of source: youtube, article, reddit, rss, other")


provider = OpenRouterProvider(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    app_url='https://feedrv.local',
    app_title='FeedRV Dashboard'
)

model = OpenRouterModel(
    'mistralai/devstral-2512:free',
    provider=provider
)
agent = Agent(
    model,
    output_type = LinkAnalysis,
    system_prompt=("You are an expert content analyst. Youre task is to analyse links",
                   "While analyzing focus on honest evaluation about content quality, source reliability and relevance. Anwser specific if it is time waste or pure education about somewthing valuable",
                   "You're provided with a URL,title, description and/or metadata and you need to generate a structured output ",
                   "Respond in english"),
)