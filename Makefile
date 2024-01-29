NAME = ft_transcendance

all:
	@printf "Execution de la configuration ${NAME}...\n"
	@docker compose up --build

clean:
	@printf "Arret de la configuration ${NAME}...\n"
	@docker compose down

fclean: clean
	@printf "Cleaning dockers\n"
	@docker system prune

status:
	docker compose ps
	docker compose ls
	docker container ls
	docker image ls
	docker volume ls

re: fclean all

.PHONY: all clean fclean re status