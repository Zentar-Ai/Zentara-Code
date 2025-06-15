def foo(x= 5):
    return x + 1

def bar():
    return 2

def main():
    baz = 5
    return baz + foo(baz) + bar()

if __name__ == '__main__':
    print("starting debugging")
    main()
