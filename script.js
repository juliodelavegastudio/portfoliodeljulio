class TinderStack {
    constructor(projects) {
        this.projects = projects;
        this.cards = [];
        this.init();
    }

    init() {
        this.createCards();
        this.addButtonListeners();
        this.initMatchesGrid();
    }

    initMatchesGrid() {
        // Créer un conteneur flex qui enveloppera tout
        const flexContainer = document.createElement('div');
        flexContainer.className = 'swipe-with-matches-container';
        
        // Créer conteneur pour les projets rejetés (gauche)
        const leftGrid = document.createElement('div');
        leftGrid.className = 'side-grid left-grid';
        leftGrid.innerHTML = `
            <h2>Dislike</h2>
            <div class="matches-grid disliked-projects"></div>
        `;
        
        // Créer conteneur pour les projets aimés (droite)
        const rightGrid = document.createElement('div');
        rightGrid.className = 'side-grid right-grid';
        rightGrid.innerHTML = `
            <h2>Vos matchs</h2>
            <div class="matches-grid liked-projects"></div>
        `;
        
        // Obtenir le conteneur Tinder
        const tinderContainer = document.querySelector('.tinder-cards').parentElement;
        const parentElement = tinderContainer.parentElement;
        
        // Supprimer l'élément Tinder du DOM temporairement
        parentElement.removeChild(tinderContainer);
        
        // Ajouter les trois éléments dans le conteneur flex
        flexContainer.appendChild(leftGrid);
        flexContainer.appendChild(tinderContainer);
        flexContainer.appendChild(rightGrid);
        
        // Ajouter le conteneur flex à la place de l'ancien élément Tinder
        parentElement.appendChild(flexContainer);
        
        // Ajouter le CSS nécessaire
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .swipe-with-matches-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 20px;
                padding: 0 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .side-grid {
                flex: 1;
                max-width: 25%;
                min-width: 200px;
                padding: 15px;
                background-color: transparent;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .side-grid h2 {
                color: #ffffff;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
            }
            
            .tinder-container {
                flex: 2;
                min-width: 300px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .matches-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .mini-card {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                cursor: pointer;
                transition: transform 0.3s;
                height: 80px;
            }
            
            .mini-card:hover {
                transform: scale(1.05);
            }
            
            .mini-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            /* Styles responsive */
            @media (max-width: 900px) {
                .swipe-with-matches-container {
                    flex-direction: column;
                }
                
                .side-grid {
                    max-width: 100%;
                    width: 100%;
                }
                
                .left-grid {
                    order: 3;
                }
                
                .right-grid {
                    order: 2;
                }
                
                .tinder-container {
                    order: 1;
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    createCards() {
        const container = document.querySelector('.tinder-cards');
        
        this.projects.forEach((project, index) => {
            // In your card creation logic
            const card = document.createElement('div');
            card.className = 'tinder-card';
            card.innerHTML = `
                <img src="${project.images[0]}" alt="${project.title}">
                <div class="card-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                </div>
                <img src="/assets/images/Tindercards/like.svg" class="like-overlay">
            `;
            
            card.style.zIndex = this.projects.length - index;
            container.appendChild(card);
            this.cards.push(card);
            
            this.addDragEvents(card);
        });
    }

    addButtonListeners() {
        document.querySelector('.nope').addEventListener('click', () => this.swipe('left'));
        document.querySelector('.like').addEventListener('click', () => this.swipe('right'));
    }

    swipe(direction) {
        if (this.cards.length === 0) return;
        
        const card = this.cards.shift();
        const projectIndex = this.projects.length - this.cards.length - 1;
        const project = this.projects[projectIndex];
        
        card.classList.add('dragging');
        card.style.transform = direction === 'left' ? 
            'translateX(-150%) rotate(-30deg)' : 
            'translateX(150%) rotate(30deg)';
        card.style.opacity = '0';
        
        // Ajouter à la grille de match
        this.createMiniCard(project, direction === 'right' ? 'liked' : 'disliked');
        
        setTimeout(() => card.remove(), 300);
    }

    addDragEvents(card) {
        let startX, isDragging = false;
        
        card.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            card.classList.add('dragging');
        });
        
        card.addEventListener('touchmove', e => {
            if (!startX) return;
            const deltaX = e.touches[0].clientX - startX;
            card.style.transform = `translateX(${deltaX}px) rotate(${deltaX/20}deg)`;
        });
        
        card.addEventListener('touchend', e => {
            const deltaX = e.changedTouches[0].clientX - startX;
            this.handleSwipe(deltaX, card);
            card.classList.remove('dragging');
        });
    }

    handleSwipe(deltaX, card) {
        const threshold = 100;
        
        if (Math.abs(deltaX) > threshold) {
            const direction = deltaX > 0 ? 'right' : 'left';
            const projectIndex = this.projects.length - this.cards.length - 1;
            const project = this.projects[projectIndex];
            
            if (direction === 'right') {
                this.handleSwipe(true); // Pour afficher l'animation de like
            }
            
            card.style.transform = direction === 'left' ? 
                'translateX(-150%) rotate(-30deg)' : 
                'translateX(150%) rotate(30deg)';
            card.style.opacity = '0';
            
            // Ajouter à la grille de match
            this.createMiniCard(project, direction === 'right' ? 'liked' : 'disliked');
            
            this.cards.shift();
            setTimeout(() => card.remove(), 300);
        } else {
            card.style.transform = '';
        }
    }

    createMiniCard(project, side) {
        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.innerHTML = `<img src="${project.images[0]}" alt="${project.title}">`;
        
        // Stocke une référence directe au projet (comme un identifiant)
        miniCard.setAttribute('data-project-title', project.title);
        
        // Nouvelle approche d'événement de clic
        miniCard.addEventListener('click', () => {
            // Trouver le projet correspondant à partir de son titre
            const projectData = this.projects.find(p => p.title === project.title);
            if (projectData) {
                this.showFullProject(projectData);
                console.log("Ouverture du projet:", projectData.title);
            } else {
                console.error("Projet non trouvé:", project.title);
            }
        });
        
        document.querySelector(`.${side}-projects`).appendChild(miniCard);
    }

    showFullProject(project) {
        // Créer un overlay pour afficher le projet
        const overlay = document.createElement('div');
        overlay.className = 'project-overlay monochrome-theme';
        
        // Construire le contenu HTML en fonction du projet
        let projectContent = `
            <div class="project-detail-narrative monochrome-theme">
                <button class="close-detail">×</button>
                <h1 class="project-title">${project.title}</h1>
                
                <div class="project-content">
                    <div class="project-hero">
                        <img src="${project.images[0]}" alt="${project.title}" class="hero-image">
                    </div>
                    
                    <div class="project-description">
                        <p class="intro-text">${project.description}</p>
                    </div>`;
        
        // Ajouter le concept si disponible
        if (project.concept) {
            projectContent += `
                    <div class="project-section">
                        <h2>Concept</h2>
                        <p>${project.concept}</p>
                        ${project.images[1] ? `<img src="${project.images[1]}" alt="Concept ${project.title}" class="content-image">` : ''}
                    </div>`;
        }
        
        // Ajouter le processus si disponible
        if (project.process) {
            projectContent += `
                    <div class="project-section">
                        <h2>Processus</h2>
                        <p>${project.process}</p>
                        ${project.images[2] ? `<img src="${project.images[2]}" alt="Processus ${project.title}" class="content-image">` : ''}
                    </div>`;
        }
        
        // Ajouter la description complète si disponible
        if (project.fullDescription) {
            projectContent += `
                    <div class="project-section">
                        <h2>Détails</h2>
                        <p>${project.fullDescription}</p>
                        ${project.images[3] ? `<img src="${project.images[3]}" alt="Détails ${project.title}" class="content-image">` : ''}
                    </div>`;
        }
        
        // Ajouter les spécifications techniques
        projectContent += `
                    <div class="project-specs">
                        <div class="specs-grid">
                            <div class="spec-item">
                                <span class="spec-title">Technologies</span>
                                <span class="spec-value">${project.technologies || 'Non spécifié'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-title">Matériaux</span>
                                <span class="spec-value">${project.materials || 'Non spécifié'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-title">Dimensions</span>
                                <span class="spec-value">${project.dimensions || 'Non spécifié'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-title">Année</span>
                                <span class="spec-value">2023</span>
                            </div>
                        </div>
                    </div>`;
        
        // Ajouter les images supplémentaires si disponibles
        if (project.images.length > 4) {
            projectContent += `
                    <div class="additional-images">
                        <h2>Plus d'images</h2>
                        <div class="images-row">`;
            
            // Ajouter les images restantes (à partir de l'index 4)
            for (let i = 4; i < project.images.length; i++) {
                projectContent += `
                            <div class="additional-image">
                                <img src="${project.images[i]}" alt="${project.title} - Image ${i+1}" class="content-image">
                            </div>`;
            }
            
            projectContent += `
                        </div>
                    </div>`;
        }
        
        // Ajouter la section commentaires
        projectContent += `
                    <div class="comments-section">
                        <h2>Commentaires</h2>
                        <div class="comments-container">
                            <div class="no-comments-message">Soyez le premier à commenter sur "${project.title}"</div>
                        </div>
                        <div class="comment-form">
                            <input type="text" class="commenter-name" placeholder="Votre nom">
                            <textarea class="comment-input" placeholder="Laissez votre commentaire..."></textarea>
                            <button class="post-comment">Publier</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        overlay.innerHTML = projectContent;
        document.body.appendChild(overlay);
        
        // Ajouter le gestionnaire d'événement pour fermer l'overlay
        overlay.querySelector('.close-detail').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Système de commentaires
        const commentsContainer = overlay.querySelector('.comments-container');
        const commenterName = overlay.querySelector('.commenter-name');
        const commentInput = overlay.querySelector('.comment-input');
        const postButton = overlay.querySelector('.post-comment');
        
        // Créer un identifiant unique pour ce projet
        const projectId = `project_${project.title.replace(/\s+/g, '_').toLowerCase()}`;
        
        // Charger les commentaires existants
        this.loadComments(projectId, commentsContainer);
        
        // Ajouter un gestionnaire d'événement pour ajouter des commentaires
        postButton.addEventListener('click', () => {
            const name = commenterName.value.trim() || 'Anonyme';
            const comment = commentInput.value.trim();
            
            if (comment) {
                this.addComment(projectId, name, comment, commentsContainer);
                commentInput.value = '';
                commenterName.value = '';
                
                // Supprime le message "Soyez le premier à commenter" s'il existe
                const noCommentsMsg = commentsContainer.querySelector('.no-comments-message');
                if (noCommentsMsg) {
                    noCommentsMsg.remove();
                }
            }
        });
    }
    
    // Méthode pour charger les commentaires depuis le localStorage
    loadComments(projectId, container) {
        try {
            const comments = JSON.parse(localStorage.getItem(projectId)) || [];
            
            if (comments.length === 0) {
                return; // Garde le message "Soyez le premier à commenter"
            }
            
            // Supprime le message "Soyez le premier à commenter" s'il existe
            const noCommentsMsg = container.querySelector('.no-comments-message');
            if (noCommentsMsg) {
                noCommentsMsg.remove();
            }
            
            // Affiche tous les commentaires stockés
            comments.forEach(comment => {
                container.innerHTML += this.createCommentHTML(comment);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des commentaires:', error);
        }
    }
    
    // Méthode pour ajouter un commentaire et le sauvegarder
    addComment(projectId, name, text, container) {
        try {
            const comment = {
                name,
                text,
                date: new Date().toISOString(),
                id: Date.now() // Identifiant unique pour le commentaire
            };
            
            // Ajouter au DOM
            container.innerHTML += this.createCommentHTML(comment);
            
            // Sauvegarder dans localStorage
            const comments = JSON.parse(localStorage.getItem(projectId)) || [];
            comments.push(comment);
            localStorage.setItem(projectId, JSON.stringify(comments));
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
        }
    }
    
    // Méthode pour créer le HTML d'un commentaire
    createCommentHTML(comment) {
        const date = new Date(comment.date);
        const formattedDate = `${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
        
        return `
            <div class="comment" data-id="${comment.id}">
                <div class="comment-header">
                    <span class="commenter-name">${comment.name}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <div class="comment-body">${comment.text}</div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Projects data with detailed descriptions and actual file names
    const projects = [
        {
            title: "TSCHUMI",
            description: "Sociability is a key issue in urban planning. How can light influence social interactions in the green spaces of La Villette, designed by Bernard Tschumi?",
            process: "Mon projet est construit autour de trois principes : concevoir une expérience utilisateur respectant l'intention architecturale de l'espace, explorer le rôle de la lumière comme outil pour favoriser la sociabilité, et s'inspirer des formes graphiques audacieuses de La Villette.",
            concept: "Ma lampe—légère, portable et rechargeable par induction—réinterprète l'esthétique du Space Age, faisant écho à l'une des influences définissantes qui donne au Parc de la Villette son identité graphique. Son halo de lumière crée un cercle de convivialité, tandis que de multiples halos interagissent scénographiquement, offrant une nouvelle perception de l'espace du parc.",
            fullDescription: "Conçu pour encourager les interactions sociales dans les espaces ouverts de La Villette, le luminaire Tschumi est basé sur des recherches sociologiques sur la sociabilité urbaine. Inspiré par les formes graphiques et illustratives du parc, il crée une expérience spatiale fluide grâce à son système de halo, façonnant des points de rencontre et des espaces de rassemblement. Accessible via un système de prêt basé sur un dépôt, ce dispositif d'éclairage modulaire et adaptable invite les visiteurs à s'engager avec le paysage du parc tout en renforçant son attrait nocturne naissant et son utilisation collective.",
            technologies: "Modélisation 3D, Impression, Conception Lumineuse",
            materials: "Verre acrylique, Bois, LED",
            dimensions: "45cm x 35cm x 20cm",
            images: [
                "assets/images/PROJETS/TSCHUMI/RENDUV3.png",
                "assets/images/PROJETS/TSCHUMI/RENDUV1.png",
                "assets/images/PROJETS/TSCHUMI/RENDUV2.png", 
                "assets/images/PROJETS/TSCHUMI/CROQUIS.png",
                "assets/images/PROJETS/TSCHUMI/MAQUETTE.jpeg",
                "assets/images/PROJETS/TSCHUMI/HALO2.png"
            ]
        },
        {
            title: "PIPELIGHT",
            description: "Dans le cadre d'une collaboration avec Leroy Merlin sur le thème de l'upcycling, on nous a donné diverses pièces de lampes cassées.",
            process: "En une semaine, notre équipe a été mise au défi de répondre à la question suivante : Comment concevoir un service de création de lampes à partir de pièces cassées ? Nous avons trouvé ce défi particulièrement stimulant, car l'upcycling est rarement fait en série—sauf par le recyclage ou la réutilisation de matières premières. L'idée de concevoir un service ajoutait une couche supplémentaire de complexité que notre équipe était désireuse de relever.",
            concept: "Diagnostic. Après analyse des lampes cassées, nous avons observé que les pièces intactes et réutilisables étaient presque toujours les bases et les abat-jours. Nous avons décidé de concentrer notre travail sur ces éléments. Faire un choix. L'esthétique et la nature modulaire des tuyaux de ventilation vendus chez Leroy Merlin nous ont inspirés. Nous avons réalisé qu'ils fournissaient un moyen systématique de connecter l'abat-jour à la base de la lampe. Une pince, renforçant l'esthétique industrielle du projet, fixe la lampe à une table.",
            fullDescription: "Expérimentation & succès. Nous avons exploré diverses compositions en utilisant toutes les bases et abat-jours disponibles, testant différentes proportions, torsions et connexions. En une seule journée, nous avons créé quatre modèles fonctionnels, prouvant l'efficacité de notre idée. Notre proposition est de mettre à disposition des clients les pièces de lampes restantes, leur permettant de concevoir leurs propres lampes de style industriel en utilisant un tuyau de ventilation, des pinces et des fixations. De plus, les employés de Leroy Merlin pourraient organiser des ateliers où les clients assemblent leurs propres lampes—similaires aux ateliers de bricolage existants dans les magasins Leroy Merlin, rendant la mise en œuvre relativement simple. L'assemblage final de la lampe nécessite des compétences techniques minimales, à l'exception du travail électrique, qui serait pris en charge par le personnel pour des raisons de sécurité.",
            technologies: "Assemblage, Électronique Simple, Finition",
            materials: "Tuyaux PVC, Connecteurs Cuivre, LED",
            dimensions: "30cm x 20cm x 40cm",
            images: [
                "assets/images/PROJETS/PIPELIGHT/PipeLightBlue.png",
                "assets/images/PROJETS/PIPELIGHT/pipelight.png",
                "assets/images/PROJETS/PIPELIGHT/pipelt.png",
                "assets/images/PROJETS/PIPELIGHT/CROQUIS.png",
                "assets/images/PROJETS/PIPELIGHT/pipelight.jpeg"
            ]
        },
        {
            title: "WATERCASTLE",
            description: "Inspiré par les formes industrielles simples des châteaux d'eau capturés par les photographes renommés Bernd et Hilla Becher.",
            process: "J'ai imaginé ce projet pour offrir aux joueurs d'échecs une plus grande liberté visuelle et d'imagination à travers le minimalisme. Les châteaux d'eau évoquent un sentiment d'originalité dans un monde où l'ornementation disparaît, ainsi qu'un sentiment de liberté. Limité par le temps, je n'avais qu'un jour pour compléter ce projet—lors d'une visite chez mon cousin dans le sud de la France, où il possède un petit tour à bois.",
            concept: "En utilisant les techniques de tournage que j'avais récemment apprises, j'ai pu créer un prototype initial en bois des pièces d'échecs.",
            fullDescription: "Dans la prochaine phase, je vais mouler les pièces ainsi que le plateau pour les reproduire en béton poli coloré. Les jeux seront joués sur un échiquier en marqueterie fait de cuir coloré, conçu dans des teintes frappantes de bleu électrique et d'orange.",
            technologies: "Modelage, Moulage, Sculpture",
            materials: "Résine, Bois, Métal",
            dimensions: "40cm x 40cm x 10cm",
            images: [
                "assets/images/PROJETS/WATERCASTEL/chess.png",
                "assets/images/PROJETS/WATERCASTEL/watercastle.jpeg",
                "assets/images/PROJETS/WATERCASTEL/watercastlenofond.png",
                "assets/images/PROJETS/WATERCASTEL/watercastletraezj$.png",
                "assets/images/PROJETS/WATERCASTEL/Wiley-Bechers-Water-Towers.webp"
            ]
        },
        {
            title: "FUTURISTICLOUNGE",
            description: "Notre objectif était de créer un espace de vie qui transcende les limites de la vie quotidienne—un lieu où la conversation devient une exploration intellectuelle et émotionnelle.",
            process: "La vision. Un milliardaire anonyme qui a fait fortune dans l'intelligence artificielle voulait créer un espace qui favorise les conversations profondes et suscite de nouvelles idées—que ce soit seul ou avec des amis. Il envisageait un environnement futuriste qui reflète son domaine d'expertise tout en incorporant une dimension spirituelle. Pour lui, tant la réflexion intérieure que le dialogue peuvent mener à de nouvelles perspectives.",
            concept: "Éléments clés de conception : Un espace paisible où les invités peuvent se détendre sans effort. Une connexion avec l'extérieur. Un cadre qui évoque l'exploration spatiale et les thèmes de la vie et de l'univers.",
            fullDescription: "Ce salon de conversation, inspiré par les technologies robotiques et de l'ère spatiale, est fortement influencé par le travail de Hajime Sorayama. Il invite au partage d'idées, à la détente et à la méditation, équilibrant la froideur métallique avec une lumière chaude. Projetée à l'intérieur d'un dôme de verre, soutenue par une structure en aluminium poli repoussé, une image holographique tridimensionnelle apparaît en utilisant la technique d'illusion du 'Pepper's Ghost'.",
            technologies: "Modélisation 3D, Domotique, Interface Tactile",
            materials: "Aluminium Anodisé, Tissu Technique, Verre Intelligent",
            dimensions: "Espace de 5m x 4m",
            images: [
                "assets/images/PROJETS/FUTURISTICLOUNGE/HOLOGRAMMERENDUREFLECTXIONFINAL.png",
                "assets/images/PROJETS/FUTURISTICLOUNGE/PLAN1.png",
                "assets/images/PROJETS/FUTURISTICLOUNGE/PLAN2.png",
                "assets/images/PROJETS/FUTURISTICLOUNGE/PROPOSITION1.png",
                "assets/images/PROJETS/FUTURISTICLOUNGE/PROPOSITION2.png"
            ]
        },
        {
            title: "PHOTON",
            description: "Je me suis lancé le défi de concevoir et fabriquer une paire de lunettes de A à Z, testant mes compétences d'artisanat à travers la technique de l'emboutissage du métal.",
            process: "Photon est un projet innovant de lunettes de pêche, réimaginé pour fusionner fonctionnalité et minimalisme. Au lieu de branches traditionnelles, ces lunettes se fixent autour de la tête avec une lanière en cuir, assurant à la fois confort et stabilité.",
            concept: "Leurs lentilles polarisées améliorent la visibilité sous l'eau, permettant une vue plus claire des poissons.",
            fullDescription: "Encore en développement, Photon est un projet que je suis déterminé à affiner et à étendre au-delà de mes études.",
            technologies: "Moulage Injection, Polissage, Traitement Antireflet",
            materials: "Acétate, Verres Polarisés, Alliage Léger",
            dimensions: "Standard Lunettes de Sport",
            images: [
                "assets/images/PROJETS/SUNGLASSES/sunglasses.jpeg"
            ]
        }
    ];
    
    // Initialisation de l'application avec les projets
    let tinderStack = new TinderStack(projects);
    
    // Assurer qu'il n'existe aucune référence globale à showFullProject
    if (window.showFullProject) {
        delete window.showFullProject;
        console.log("Fonction showFullProject globale supprimée");
    }
    
    // Styles mis à jour pour la présentation narrative
    const narrativeStyles = `
        .project-overlay.monochrome-theme {
            background-color: rgba(0, 0, 0, 0.95);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow-y: auto;
            padding: 20px;
        }
        
        .project-detail-narrative {
            background-color: #111;
            color: #fff;
            width: 100%;
            max-width: 800px;
            padding: 40px;
            position: relative;
            margin: auto;
        }
        
        .close-detail {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 30px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
        }
        
        .project-title {
            font-size: 32px;
            margin-bottom: 30px;
            color: #fff;
            text-align: center;
            border-bottom: 1px solid #333;
            padding-bottom: 15px;
        }
        
        .project-content {
            margin-bottom: 40px;
        }
        
        .project-hero {
            margin-bottom: 30px;
        }
        
        .hero-image {
            width: 100%;
            max-height: 500px;
            object-fit: contain;
        }
        
        .intro-text {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #ccc;
        }
        
        .project-section {
            margin-bottom: 40px;
        }
        
        .project-section h2 {
            font-size: 24px;
            margin-bottom: 15px;
            color: #fff;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
        }
        
        .project-section p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #ccc;
        }
        
        .content-image {
            width: 100%;
            margin: 20px 0;
            object-fit: contain;
        }
        
        .project-specs {
            background-color: #1a1a1a;
            padding: 20px;
            margin: 30px 0;
            border-left: 3px solid #333;
        }
        
        .specs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .spec-item {
            display: flex;
            flex-direction: column;
        }
        
        .spec-title {
            font-weight: bold;
            color: #999;
            margin-bottom: 5px;
        }
        
        .spec-value {
            color: #fff;
        }
        
        .additional-images h2 {
            font-size: 24px;
            margin-bottom: 15px;
            color: #fff;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
        }
        
        .images-row {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .additional-image img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.3s;
        }
        
        .additional-image img:hover {
            transform: scale(1.03);
        }
        
        .comments-section {
            margin-top: 40px;
            border-top: 1px solid #333;
            padding-top: 30px;
        }
        
        .comments-section h2 {
            font-size: 24px;
            margin-bottom: 15px;
            color: #fff;
        }
        
        .comments-container {
            background-color: #1a1a1a;
            border-radius: 0;
            padding: 15px;
            max-height: 350px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .no-comments-message {
            text-align: center;
            padding: 20px;
            color: #777;
            font-style: italic;
        }
        
        .comment {
            background-color: #2a2a2a;
            border-left: 3px solid #444;
            margin-bottom: 15px;
            padding: 10px 15px;
        }
        
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9em;
        }
        
        .commenter-name {
            font-weight: bold;
            color: #ddd;
        }
        
        .comment-date {
            color: #777;
        }
        
        .comment-body {
            color: #bbb;
            line-height: 1.4;
        }
        
        .comment-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .comment-form input, 
        .comment-form textarea {
            background-color: #1a1a1a;
            color: #fff;
            border: 1px solid #333;
            padding: 10px;
            width: 100%;
        }
        
        .comment-form textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .post-comment {
            align-self: flex-end;
            background-color: #333;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .post-comment:hover {
            background-color: #444;
        }
        
        @media (max-width: 768px) {
            .project-detail-narrative {
                padding: 20px;
            }
            
            .specs-grid {
                grid-template-columns: 1fr;
            }
            
            .images-row {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    const styleNarrative = document.createElement('style');
    styleNarrative.textContent = narrativeStyles;
    document.head.appendChild(styleNarrative);
    
    // Initialise les carrousels de projet si nécessaire
    initProjectCarousels();
});


function initProjectCarousels() {
    document.querySelectorAll('.project-card').forEach(card => {
        const images = card.querySelectorAll('.carousel-image');
        const dotsContainer = card.querySelector('.carousel-dots');
        
        if (!images.length || !dotsContainer) return;
        
        // Création des dots
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot${index === 0 ? ' active' : ''}`;
            dot.addEventListener('click', () => showImage(card, index));
            dotsContainer.appendChild(dot);
        });

        function showImage(container, index) {
            container.querySelectorAll('.carousel-image').forEach(img => img.classList.remove('active'));
            container.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            images[index].classList.add('active');
            dotsContainer.children[index].classList.add('active');
        }
    });
}

