from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from typing_extensions import List
from langchain_core.prompts import PromptTemplate

from dotenv import load_dotenv

load_dotenv()

class Definition(BaseModel):
    """Individual definition entry for a word with grammatical context."""
    part_of_speech: List[str] = Field(
        description="Grammatical category of the word (noun, verb, adjective, adverb, etc.)"
    )
    meaning: str = Field(
        description="Clear, concise explanation of what the word means in this context"
    )
    contextual_meaning: str = Field(
        description="Additional context or nuanced meaning, including usage scenarios or specialized meanings"
    )

class Pronunciation(BaseModel):
    """Phonetic representation of word pronunciation."""
    phonetic: str = Field(
        description="International Phonetic Alphabet (IPA) transcription or phonetic spelling of the word"
    )

class Translation(BaseModel):
    """Translation details for a word in a specific target language."""
    language: str = Field(
        description="Target language name or ISO code (e.g., 'Telugu', 'Hindi', 'en', 'ta')"
    )
    translated_word: str = Field(
        description="The word translated into the target language"
    )
    part_of_speech: List[str] = Field(
        description="Part of speech of the translated word in the target language"
    )
    pronunciation: Pronunciation = Field(
        default_factory=Pronunciation,
        description="Phonetic pronunciation of the translated word"
    )
    contextual_sentence: str = Field(
        description="Example sentence using the translated word in natural context"
    )
    cultural_note: str = Field(
        description="Cultural context, usage notes, or regional variations for the translation"
    )

class Related_words(BaseModel):
    """Words related to the main entry with relationship details."""
    word: str = Field(
        description="The related word or phrase"
    )
    relation: str = Field(
        description="Type of relationship (synonym, antonym, derivative, compound, idiom, etc.)"
    )
    description: str = Field(
        description="Brief explanation of how this word relates to the main entry"
    )
    translation: Translation = Field(
        description="Translation details for the related word"
    )

class Dictionary(BaseModel):
    """
    Comprehensive dictionary entry structure for multilingual word analysis.
    
    This schema captures detailed linguistic information including definitions,
    pronunciations, translations, etymology, and related words to provide
    complete lexical analysis suitable for language learning and reference.
    """
    
    definition: List[Definition] = Field(
        description="List of definitions for different meanings or uses of the word, ordered by frequency or importance"
    )
    pronunciation: Pronunciation = Field(
        description="Primary pronunciation of the word in its original language"
    )
    etymology: str = Field(
        description="Historical origin and development of the word, including root languages and evolution"
    )
    synonyms: List[str] = Field(
        description="List of words with similar or identical meanings in the same language"
    )
    antonyms: List[str] = Field(
        description="List of words with opposite meanings in the same language"
    )
    example_sentences: List[str] = Field(
        description="Natural example sentences demonstrating proper usage of the word in context"
    )
    translation: Translation = Field(
        description="Primary translation of the word into a target language"
    )
    related_words: List[Related_words] = Field(
        description="Collection of linguistically related words including derivatives, compounds, and idiomatic expressions"
    )
    
    # class Config:
    #     """Pydantic configuration for the Dictionary model."""
    #     title = "Multilingual Dictionary Entry"
    #     description = "Comprehensive dictionary structure for detailed word analysis and translation"
    #     json_schema_extra = {
    #         "example": {
    #             "definition": [
    #                 {
    #                     "part_of_speech": "noun",
    #                     "meaning": "A feeling of great pleasure and happiness",
    #                     "contextual_meaning": "Often used to describe intense emotional satisfaction or delight"
    #                 }
    #             ],
    #             "pronunciation": {
    #                 "phonetic": "/dʒɔɪ/"
    #             },
    #             "etymology": "Middle English, from Old French joie, from Latin gaudia, plural of gaudium",
    #             "synonyms": ["happiness", "delight", "pleasure", "bliss"],
    #             "antonyms": ["sorrow", "sadness", "misery"],
    #             "example_sentences": [
    #                 "She felt pure joy when she saw her family again.",
    #                 "The children's laughter filled the room with joy."
    #             ],
    #             "translation": {
    #                 "language": "Telugu",
    #                 "translated_word": "alegría",
    #                 "part_of_speech": "sustantivo",
    #                 "pronunciation": {
    #                     "phonetic": "/aleˈɣɾi.a/"
    #                 },
    #                 "contextual_sentence": "Sintió una gran alegría al ver a su familia.",
    #                 "cultural_note": "Often used in celebrations and positive contexts"
    #             },
    #             "related_words": [
    #                 {
    #                     "word": "joyful",
    #                     "relation": "adjective form",
    #                     "description": "Adjective describing someone or something full of joy",
    #                     "translation": {
    #                         "language": "Spanish",
    #                         "translated_word": "alegre",
    #                         "part_of_speech": "adjetivo",
    #                         "pronunciation": {
    #                             "phonetic": "/aˈleɣɾe/"
    #                         },
    #                         "contextual_sentence": "Es una persona muy alegre.",
    #                         "cultural_note": "Commonly used to describe personality"
    #                     }
    #                 }
    #             ]
    #         }
    #     }


def get_model_data(word,target_language="Telugu",api_provider="llama"):

    match api_provider:
        case "qwen":
            llm = ChatGroq(model="qwen/qwen3-32b")
        case "openAI":
            llm = ChatGroq(model="openai/gpt-oss-20b")
        case _:
            llm = ChatGroq(model="llama-3.3-70b-versatile")
    

    structured_llm = llm.with_structured_output(Dictionary)

    structure_prompt = PromptTemplate.from_template("""
        Create a comprehensive structured dictionary entry for the word "{word}" based on this information:

        Target Language: {target_language}

        Please create a complete Dictionary entry with:
        1. Multiple definitions with parts of speech
        2. Phonetic pronunciation
        3. Etymology from the analysis
        4. Synonyms and antonyms found
        5. Example sentences
        6. Translation to {target_language}
        7. Related words with relationships

        Make it comprehensive and educational.
        - Related words (word, relation, description, and translation in {target_language} with language, translated word, part of speech, pronunciation, contextual sentence, cultural note)
        Return the response in JSON format.
        """)

    formatted_prompt = structure_prompt.format(
        word=word,
        target_language=target_language
    )
    response = structured_llm.invoke(formatted_prompt)
    return response
