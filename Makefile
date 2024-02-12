NAME = ft_transcendence

all:
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