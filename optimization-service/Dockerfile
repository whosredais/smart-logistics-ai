FROM python:3.10-slim

WORKDIR /app

# Copie des dépendances et installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY consumer.py .

# Commande de lancement (L'option -u permet de voir les logs Python en temps réel)
CMD ["python", "-u", "consumer.py"]