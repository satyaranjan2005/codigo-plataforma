pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'Node14', type: 'NodeJS'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
    }


    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/satyaranjan2005/codigo-plataforma.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install frontend dependencies
                dir('frontend') {
                    sh 'npm install'
                }
                // Install backend dependencies
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                // Build frontend (Next.js)
                dir('frontend') {
                    sh 'npm run build -- -p 3001'
                }
                // Build backend if needed (e.g., TypeScript)
                dir('backend') {
                    sh 'npm start || echo "No build step for backend"'
                }
            }
        }

        stage('Deploy') {
            steps {
                // Deploy frontend using PM2
                dir('frontend') {
                    sh '''
                    pm2 stop nextjs-frontend || true
                    pm2 start npm --name "frontend" -- start
                    '''
                }

                // Deploy backend using PM2
                dir('backend') {
                    sh '''
                    pm2 stop node-backend || true
                    pm2 start npm --name "backend" -- start
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Frontend and Backend deployed successfully!'
        }
        failure {
            echo 'Build or deployment failed!'
        }
    }
}