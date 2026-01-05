#!/usr/bin/env python3
"""
Serveur HTTP personnalisé pour MAJAY
Gère le routage et empêche l'affichage de la liste des fichiers
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Gestionnaire HTTP personnalisé avec routage"""
    
    def end_headers(self):
        # Ajouter des en-têtes de sécurité
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()
    
    def list_directory(self, path):
        """Empêcher l'affichage de la liste des fichiers"""
        # Rediriger vers index.html si disponible
        index_path = os.path.join(path, 'index.html')
        if os.path.exists(index_path):
            self.path = self.path.rstrip('/') + '/index.html'
            return self.do_GET()
        
        # Sinon, retourner une erreur 403
        self.send_error(403, "Accès interdit - Liste des fichiers désactivée")
        return None
    
    def do_GET(self):
        """Gérer les requêtes GET avec routage"""
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # Si on accède à /admin/, rediriger vers /admin/index.html
        if path == '/admin' or path == '/admin/':
            self.send_response(302)
            self.send_header('Location', '/admin/index.html')
            self.end_headers()
            return
        
        # Si on accède à /vendeur/, rediriger vers /vendeur/index.html
        if path == '/vendeur' or path == '/vendeur/':
            self.send_response(302)
            self.send_header('Location', '/vendeur/index.html')
            self.end_headers()
            return
        
        # Appeler la méthode parente pour servir les fichiers
        return super().do_GET()

def run_server(port=8000):
    """Lancer le serveur"""
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🚀 Serveur MAJAY démarré sur http://localhost:{port}")
        print(f"📁 Répertoire: {os.getcwd()}")
        print(f"🛑 Appuyez sur Ctrl+C pour arrêter")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Arrêt du serveur...")
            httpd.shutdown()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

