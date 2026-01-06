from pydantic import BaseModel,Field
from pydantic_ai import Agent
class LinkAnalysis(BaseModel):
    url: str = Field(..., description="The URL of the link to analyze")
    title: str = Field(..., description="The title of the link")
    summary: str = Field(..., description="A brief summary of the content at the link")
    tags: list[str] = Field(..., description="List of 3-5 relevant tags for the link i.e. coding, study, gaming, in lowercase")
    priority: int = Field(..., ge=1, le=10, description="Priority level from 1 to 10")
    source_type: str = Field(..., description="Type of source: youtube, article, reddit, rss, other")
agent = Agent(
    'google-gla:gemini-flash-lite-latest',
    output_type = LinkAnalysis,
    system_prompt=("You are an expert content analyst. Youre task is to analyse links",
                   "You're provided with a URL,title, description and/or metadata and you need to generate a structured output ",
                   "Respond in english"),
)