"""
agents package
--------------
Expõe o grafo compilado e a função chat() para integração com a aplicação.

Uso rápido:
    from agents import graph, chat

    # API simples
    response = chat("Quais jogos de RPG vocês têm?", session_id="user-123")

    # Com usuário autenticado (para tools de carrinho/biblioteca)
    response = chat("Quero ver meu carrinho", session_id="user-123", usuario_id=42)

    # Streaming (LangGraph nativo)
    from langchain_core.messages import HumanMessage
    for chunk in graph.stream(
        {"messages": [HumanMessage(content="Olá!")], "intent": "", "blocked": False},
        stream_mode="values",
    ):
        print(chunk["messages"][-1].content)
"""

from agents.gamebot_agent import chat, chat_with_metadata, graph

__all__ = ["graph", "chat", "chat_with_metadata"]
