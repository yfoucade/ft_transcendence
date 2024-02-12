NAME = ft_transcendence

all:
		@if [ ! -f .env ]; then \
		echo "❌ The neccessary .env file is not in srcs as expected/"; \
	fi
	@printf "Execution de la configuration ${NAME}...\n"
	@docker compose up --build

clean:
	@printf "Arret de la configuration de ${NAME}...\n"
	@docker compose down -v --remove-orphans

fclean: clean
	@printf "Cleaning dockers\n"
	@docker system prune -af --volumes

re: fclean all

.PHONY: all clean fclean re