import bcrypt

# Defina a senha que você quer hashar
password = "minhasenhateste123" # <<< ALtere esta senha para a que você deseja usar

# Gere o hash da senha
# bcrypt.gensalt() gera um "salt" aleatório, que é adicionado à senha antes de hashar
# Isso garante que duas senhas iguais tenham hashes diferentes, aumentando a segurança
hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Imprima o hash gerado
print(hashed_password.decode('utf-8'))