NAME = ft_transcendence

all:
	@if [ ! -f .env ]; then \
		echo "❌ The neccessary .env file is not where it is expected to be/"; \
	fi
	@if [ -f .env ]; then \
	printf "Execution de la configuration ${NAME}...\n"; \
	docker compose up --build; \
	fi

clean:
	@printf "Arret de la configuration de ${NAME}...\n"
	@docker compose down --rmi all -v --remove-orphans

fclean: clean
	@printf "Cleaning dockers\n"
	@docker system prune -af --volumes

re: fclean all

.PHONY: all clean fclean re